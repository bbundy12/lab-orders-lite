import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Order } from "./use-orders";
import { orderKeys } from "./use-orders";

export interface UpdateOrderStatusInput {
  status: "DRAFT" | "SUBMITTED" | "IN_PROGRESS" | "READY" | "CANCELLED";
}

/**
 * Hook to fetch a single order with full details
 */
export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: async (): Promise<Order> => {
      const response = await fetch(`/api/orders/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Order not found");
        }
        throw new Error("Failed to fetch order");
      }
      return response.json();
    },
    enabled: !!id,
  });
}

/**
 * Hook to update order status with optimistic updates and rollback
 */
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: UpdateOrderStatusInput["status"];
    }): Promise<Order> => {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error) {
          throw new Error(errorData.error);
        }
        throw new Error("Failed to update order status");
      }

      return response.json();
    },
    onMutate: async ({ orderId, status }) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: orderKeys.detail(orderId) });

      // Snapshot the previous value for rollback
      const previousOrder = queryClient.getQueryData<Order>(orderKeys.detail(orderId));

      // Optimistically update the order
      if (previousOrder) {
        const optimisticOrder: Order = {
          ...previousOrder,
          status,
          updatedAt: new Date().toISOString(),
        };

        queryClient.setQueryData(orderKeys.detail(orderId), optimisticOrder);
      }

      // Also update in lists
      queryClient.setQueriesData(
        { queryKey: orderKeys.lists() },
        (oldData: Order[] | undefined) => {
          if (!oldData) return oldData;

          return oldData.map((order) =>
            order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
          );
        }
      );

      // Return a context object with the snapshotted value
      return { previousOrder };
    },
    onError: (_, { orderId }, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousOrder) {
        queryClient.setQueryData(orderKeys.detail(orderId), context.previousOrder);
      }
    },
    onSettled: (data, _, { orderId }) => {
      // Always refetch after error or success to ensure we have the latest data
      queryClient.invalidateQueries({
        queryKey: orderKeys.detail(orderId),
      });
      queryClient.invalidateQueries({
        queryKey: orderKeys.lists(),
      });
    },
  });
}
