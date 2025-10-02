import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface LabTest {
  id: string;
  code: string;
  name: string;
  priceCents: number;
  turnaroundDays: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLabTestInput {
  code: string;
  name: string;
  priceCents: number;
  turnaroundDays: number;
  isActive?: boolean;
}

export interface UpdateLabTestInput {
  code?: string;
  name?: string;
  priceCents?: number;
  turnaroundDays?: number;
  isActive?: boolean;
}

// Query Key Factory
export const testKeys = {
  all: ["tests"] as const,
  lists: () => [...testKeys.all, "list"] as const,
  list: (filters: { activeOnly?: boolean } = {}) => [...testKeys.lists(), filters] as const,
  details: () => [...testKeys.all, "detail"] as const,
  detail: (id: string) => [...testKeys.details(), id] as const,
};

/**
 * Hook to fetch lab tests with optional active-only filter
 */
export function useLabTests(activeOnly: boolean = false) {
  const params = new URLSearchParams();
  if (activeOnly) params.set("activeOnly", "1");

  return useQuery({
    queryKey: testKeys.list({ activeOnly }),
    queryFn: async (): Promise<LabTest[]> => {
      const response = await fetch(`/api/tests?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch lab tests");
      }
      return response.json();
    },
  });
}

/**
 * Hook to create a new lab test
 */
export function useCreateLabTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateLabTestInput): Promise<LabTest> => {
      const response = await fetch("/api/tests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          throw new Error(errorData.errors.map((e: any) => e.message).join(", "));
        }
        throw new Error("Failed to create lab test");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: testKeys.all,
      });
    },
  });
}

/**
 * Hook to update a lab test (toggle active status, edit details)
 */
export function useUpdateLabTest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string;
      input: UpdateLabTestInput;
    }): Promise<LabTest> => {
      const response = await fetch(`/api/tests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          throw new Error(errorData.errors.map((e: any) => e.message).join(", "));
        }
        throw new Error("Failed to update lab test");
      }

      return response.json();
    },
    onSuccess: (updatedTest, { id }) => {
      // Invalidate lists
      queryClient.invalidateQueries({
        queryKey: testKeys.lists(),
      });
      // Update the specific test in cache
      queryClient.setQueryData(testKeys.detail(id), updatedTest);
    },
  });
}
