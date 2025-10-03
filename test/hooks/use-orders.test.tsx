import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { ReactNode } from "react";

import { useOrders, useCreateOrder, orderKeys } from "@/hooks/use-orders";

const mockFetch = global.fetch as unknown as Mock;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  return { wrapper, queryClient };
};

describe("useOrders", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("fetches orders with filters", async () => {
    mockFetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue([{ id: "1" }]) });

    const { wrapper } = createWrapper();
    const { result } = renderHook(
      () => useOrders({ status: "SUBMITTED", patient: "p1", q: "alice" }),
      { wrapper }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/orders?status=SUBMITTED&patient=p1&q=alice");
  });

  it("returns error when fetch fails", async () => {
    mockFetch.mockResolvedValue({ ok: false, json: vi.fn() });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useOrders(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useCreateOrder", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("creates orders and updates caches", async () => {
    const fakeOrder = { id: "o1" };
    mockFetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(fakeOrder) });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const setQuerySpy = vi.spyOn(queryClient, "setQueryData");

    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    await result.current.mutate({
      patientId: "p1",
      items: [{ labTestId: "t1", unitPriceCents: 1000, turnaroundDaysAtOrder: 2 }],
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/orders",
      expect.objectContaining({ method: "POST" })
    );

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: orderKeys.all }));
    expect(setQuerySpy).toHaveBeenCalledWith(orderKeys.detail("o1"), fakeOrder);
  });

  it("surfaces validation errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: vi.fn().mockResolvedValue({ errors: [{ message: "Invalid" }] }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateOrder(), { wrapper });

    await expect(
      result.current.mutate({
        patientId: "p1",
        items: [{ labTestId: "t1", unitPriceCents: 1000, turnaroundDaysAtOrder: 2 }],
      })
    ).rejects.toThrow(/Invalid/);
  });
});
