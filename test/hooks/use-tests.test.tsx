import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { ReactNode } from "react";

import { useLabTests, useCreateLabTest, useUpdateLabTest, testKeys } from "@/hooks/use-tests";

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

describe("useLabTests", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("fetches active tests when requested", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue([{ id: "t1" }]),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLabTests(true), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockFetch).toHaveBeenCalledWith("/api/tests?activeOnly=1");
  });

  it("throws on fetch error", async () => {
    mockFetch.mockResolvedValue({ ok: false, status: 500, json: vi.fn() });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useLabTests(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useCreateLabTest", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("creates test and invalidates queries", async () => {
    const fakeTest = { id: "t1" };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(fakeTest),
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreateLabTest(), { wrapper });

    await result.current.mutateAsync({
      code: "A1",
      name: "Panel",
      priceCents: 1000,
      turnaroundDays: 2,
    });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tests",
      expect.objectContaining({ method: "POST" })
    );

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: testKeys.all }));
  });

  it("propagates validation errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ errors: [{ message: "Invalid" }] }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreateLabTest(), { wrapper });

    await expect(
      result.current.mutateAsync({
        code: "A1",
        name: "Panel",
        priceCents: 1000,
        turnaroundDays: 2,
      })
    ).rejects.toThrow("Invalid");
  });
});

describe("useUpdateLabTest", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("updates test and caches", async () => {
    const fakeTest = { id: "t1", isActive: true };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(fakeTest),
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
    const setDataSpy = vi.spyOn(queryClient, "setQueryData");

    const { result } = renderHook(() => useUpdateLabTest(), { wrapper });

    await result.current.mutateAsync({ id: "t1", input: { isActive: false } });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tests/t1",
      expect.objectContaining({ method: "PATCH" })
    );

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: testKeys.lists() }));
    expect(setDataSpy).toHaveBeenCalledWith(testKeys.detail("t1"), fakeTest);
  });

  it("throws on API errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ errors: [{ message: "Invalid" }] }),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdateLabTest(), { wrapper });

    await expect(result.current.mutateAsync({ id: "t1", input: {} })).rejects.toThrow("Invalid");
  });
});
