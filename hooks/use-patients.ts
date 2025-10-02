import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface Patient {
  id: string;
  fullName: string;
  dob: string;
  email?: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  fullName: string;
  dob: string;
  email?: string;
  phone?: string;
}

// Query Key Factory
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (filters: { search?: string } = {}) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

/**
 * Hook to fetch patients with optional search
 */
export function usePatients(search?: string) {
  const params = new URLSearchParams();
  if (search) params.set("search", search);

  return useQuery({
    queryKey: patientKeys.list({ search }),
    queryFn: async (): Promise<Patient[]> => {
      const response = await fetch(`/api/patients?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch patients");
      }
      return response.json();
    },
  });
}

/**
 * Hook to create a new patient
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePatientInput): Promise<Patient> => {
      const response = await fetch("/api/patients", {
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
        throw new Error("Failed to create patient");
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch patients queries
      queryClient.invalidateQueries({
        queryKey: patientKeys.all,
      });
    },
  });
}
