"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatDate, formatDateTime } from "@/lib/date";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useParams } from "next/navigation";
import { useOrder, useUpdateOrderStatus } from "@/hooks/use-order";
import type { UpdateOrderStatusInput } from "@/hooks/use-order";
import { formatMoney } from "@/lib/calculations";

const STATUS_TRANSITIONS: Record<
  UpdateOrderStatusInput["status"],
  Array<{ status: UpdateOrderStatusInput["status"]; label: string }>
> = {
  DRAFT: [
    { status: "SUBMITTED", label: "Submit Order" },
    { status: "CANCELLED", label: "Cancel" },
  ],
  SUBMITTED: [
    { status: "IN_PROGRESS", label: "Start Processing" },
    { status: "CANCELLED", label: "Cancel" },
  ],
  IN_PROGRESS: [{ status: "READY", label: "Mark as Ready" }],
  READY: [],
  CANCELLED: [],
};

export default function OrderDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const { toast } = useToast();

  const { data: order, isLoading, error } = useOrder(id);
  const updateStatusMutation = useUpdateOrderStatus();

  const handleStatusUpdate = (newStatus: UpdateOrderStatusInput["status"]) => {
    updateStatusMutation.mutate(
      { orderId: id, status: newStatus },
      {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Order status updated",
          });
        },
        onError: (error: Error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center py-12 text-muted-foreground">Loading order...</div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Order Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The order you&apos;re looking for doesn&apos;t exist or has been deleted.
          </p>
          <Link href="/orders">
            <Button className="rounded-xl">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const availableTransitions = STATUS_TRANSITIONS[order.status] || [];

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/orders">
          <Button variant="outline" size="sm" className="rounded-xl">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Order Details</h1>
          <p className="text-slate-600">View and manage order #{order.id.slice(-8)}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status Card */}
          <Card className="rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order Status
                <OrderStatusBadge status={order.status} />
              </CardTitle>
              <CardDescription>Current status and available actions</CardDescription>
            </CardHeader>
            <CardContent>
              {availableTransitions.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Available Actions:</p>
                  <div className="flex gap-3 flex-wrap">
                    {availableTransitions.map((transition) => (
                      <Button
                        key={transition.status}
                        variant={transition.status === "CANCELLED" ? "destructive" : "default"}
                        onClick={() => handleStatusUpdate(transition.status)}
                        disabled={updateStatusMutation.isPending}
                        className="rounded-xl"
                      >
                        {updateStatusMutation.isPending ? "Updating..." : transition.label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Tests included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Test</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Turnaround</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <div className="font-mono font-medium">{item.labTest.code}</div>
                            <div className="text-sm text-muted-foreground">{item.labTest.name}</div>
                          </div>
                        </TableCell>
                        <TableCell>{formatMoney(item.unitPriceCents)}</TableCell>
                        <TableCell>{item.turnaroundDaysAtOrder} days</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Patient Info */}
          <Card className="rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{order.patient.fullName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date of Birth</p>
                <p className="font-medium">{formatDate(order.patient.dob)}</p>
              </div>
              {order.patient.email && (
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{order.patient.email}</p>
                </div>
              )}
              {order.patient.phone && (
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{order.patient.phone}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card className="rounded-3xl shadow-lg">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Cost:</span>
                  <span className="text-xl font-bold">{formatMoney(order.totalCents)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Placed:</span>
                    <span className="font-medium">{formatDateTime(order.placedAt)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Estimated Ready:</span>
                    <span className="font-medium">
                      {order.estimatedReadyAt ? formatDateTime(order.estimatedReadyAt) : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Number of Tests:</span>
                    <span className="font-medium">{order.items.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
