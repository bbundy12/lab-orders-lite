import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type UpdatePatientInput } from "@/lib/validation/patient";

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

export interface SearchFilters {
  query: string;
  field: "name" | "email" | "phone" | "birthdate" | "all";
}

// Query Key Factory
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (filters: SearchFilters = { query: "", field: "all" }) =>
    [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
};

/**
 * Hook to fetch patients with search filters
 */
export function usePatients(filters: SearchFilters = { query: "", field: "all" }) {
  const params = new URLSearchParams();
  if (filters.query) {
    params.set("search", filters.query);
    params.set("field", filters.field);
  }

  return useQuery({
    queryKey: patientKeys.list(filters),
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
      console.log("=== HOOK PATIENT CREATION DEBUG ===");
      console.log("Input data:", input);

      const response = await fetch("/api/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error response:", errorData);
        if (errorData.errors) {
          throw new Error(errorData.errors.map((e: any) => e.message).join(", "));
        }
        throw new Error("Failed to create patient");
      }

      const result = await response.json();
      console.log("✅ API Success response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("✅ Mutation success, invalidating queries...");
      // Invalidate and refetch patients queries
      queryClient.invalidateQueries({
        queryKey: patientKeys.all,
      });
    },
    onError: (error) => {
      console.error("❌ Mutation error:", error);
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdatePatientInput): Promise<Patient> => {
      console.log("=== HOOK PATIENT UPDATE DEBUG ===");
      console.log("Input data:", input);

      const response = await fetch(`/api/patients`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(input),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ API Error response:", errorData);
        if (errorData.errors) {
          throw new Error(errorData.errors.map((e: any) => e.message).join(", "));
        }
        throw new Error("Failed to update patient");
      }

      const result = await response.json();
      console.log("✅ API Success response:", result);
      return result;
    },
    onSuccess: (data) => {
      console.log("✅ Patient update success, updating cache...");
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      if (data.id) {
        queryClient.invalidateQueries({ queryKey: patientKeys.detail(data.id) });
      }
    },
    onError: (error) => {
      console.error("❌ Patient update mutation error:", error);
    },
  });
}
