import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Mock } from "vitest";
import type { ReactNode } from "react";

import { usePatients, useCreatePatient, useUpdatePatient, patientKeys } from "@/hooks/use-patients";

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

describe("usePatients", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("fetches patients successfully", async () => {
    const fakePatients = [{ id: "1", fullName: "Alice" }];
    mockFetch.mockResolvedValue({ ok: true, json: vi.fn().mockResolvedValue(fakePatients) });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatients({ query: "alice", field: "name" }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(fakePatients);
    expect(mockFetch).toHaveBeenCalledWith("/api/patients?search=alice&field=name");
  });

  it("handles fetch errors", async () => {
    mockFetch.mockResolvedValue({ ok: false, json: vi.fn() });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeInstanceOf(Error);
  });
});

describe("useCreatePatient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("creates patient and invalidates caches", async () => {
    const fakePatient = { id: "1", fullName: "Alice" };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(fakePatient),
      headers: new Map(),
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCreatePatient(), { wrapper });

    await result.current.mutateAsync({ fullName: "Alice", dob: "1990-01-01" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/patients",
      expect.objectContaining({ method: "POST" })
    );

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: patientKeys.all }));
  });

  it("throws when API returns validation errors", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ errors: [{ message: "Invalid" }] }),
      headers: new Map(),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCreatePatient(), { wrapper });

    await expect(
      result.current.mutateAsync({ fullName: "Alice", dob: "1990-01-01" })
    ).rejects.toThrow("Invalid");
  });
});

describe("useUpdatePatient", () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it("updates patient and invalidates caches", async () => {
    const fakePatient = { id: "1", fullName: "Alice" };
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(fakePatient),
      headers: new Map(),
    });

    const { wrapper, queryClient } = createWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useUpdatePatient(), { wrapper });

    await result.current.mutateAsync({ id: "1", fullName: "Alice" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/patients",
      expect.objectContaining({ method: "PATCH" })
    );

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: patientKeys.all }));
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: patientKeys.detail("1") })
    );
  });

  it("propagates API error messages", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: vi.fn().mockResolvedValue({ errors: [{ message: "Invalid" }] }),
      headers: new Map(),
    });

    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useUpdatePatient(), { wrapper });

    await expect(result.current.mutateAsync({ id: "1", fullName: "" })).rejects.toThrow("Invalid");
  });
});
