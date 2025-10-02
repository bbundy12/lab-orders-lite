import { useQuery, useQueryClient } from "@tanstack/react-query";
import { LabTest } from "./use-tests";
import { Patient } from "./use-patients";

export interface OrderItem {
  id: string;
  orderId: string;
  labTestId: string;
  unitPriceCents: number;
  turnaroundDaysAtOrder: number;
  createdAt: string;
  labTest: LabTest;
}

export interface Order {
  id: string;
  patientId: string;
  status: "DRAFT" | "SUBMITTED" | "IN_PROGRESS" | "READY" | "CANCELLED";
  totalCents: number;
  placedAt: string;
  estimatedReadyAt: string;
  createdAt: string;
  updatedAt: string;
  patient: Patient;
  items: OrderItem[];
}

export interface CreateOrderInput {
  patientId: string;
  items: Array<{
    labTestId: string;
    unitPriceCents: number;
    turnaroundDaysAtOrder: number;
  }>;
}

export interface OrderFilters {
  status?: string;
  patient?: string;
  q?: string;
}

// Query Key Factory
export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (filters: OrderFilters = {}) => [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, "detail"] as const,
  detail: (id: string) => [...orderKeys.details(), id] as const,
};

/**
 * Hook to fetch orders with optional filters
 */
export function useOrders(filters: OrderFilters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.patient) params.set("patient", filters.patient);
  if (filters.q) params.set("q", filters.q);

  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: async (): Promise<Order[]> => {
      const response = await fetch(`/api/orders?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      return response.json();
    },
  });
}

/**
 * Hook to create a new order with optimistic updates
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return {
    mutate: async ({ patientId, items }: CreateOrderInput) => {
      // Optimistic UI: we'll show the loading state
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ patientId, items }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.errors) {
          throw new Error(errorData.errors.map((e: any) => e.message).join(", "));
        }
        throw new Error("Failed to create order");
      }

      const newOrder = await response.json();

      // Invalidate and refetch orders queries
      queryClient.invalidateQueries({
        queryKey: orderKeys.all,
      });

      // Pre-populate the single order cache
      queryClient.setQueryData(orderKeys.detail(newOrder.id), newOrder);

      return newOrder;
    },
  };
}
