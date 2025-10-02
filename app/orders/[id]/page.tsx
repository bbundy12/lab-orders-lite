"use client"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { formatDate, formatDateTime } from "@/lib/date"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useParams } from "next/navigation"

interface OrderDetail {
  id: string
  status: "DRAFT" | "SUBMITTED" | "IN_PROGRESS" | "READY" | "CANCELLED"
  totalCents: number
  placedAt: string
  estimatedReadyAt: string | null
  patient: {
    id: string
    name: string
    dateOfBirth: string
    phone: string | null
    email: string | null
  }
  items: Array<{
    id: string
    unitPriceCents: number
    turnaroundDaysAtOrder: number
    test: {
      code: string
      name: string
    }
  }>
}

const STATUS_TRANSITIONS: Record<string, Array<{ status: string; label: string }>> = {
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
}

export default function OrderDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: order, isLoading } = useQuery<OrderDetail>({
    queryKey: ["order", id],
    queryFn: async () => {
      const response = await fetch(`/api/orders/${id}`)
      if (!response.ok) throw new Error("Failed to fetch order")
      return response.json()
    },
    enabled: !!id,
  })

  const updateStatus = useMutation({
    mutationFn: async (status: string) => {
      const response = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      toast({
        title: "Success",
        description: "Order status updated",
      })
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center py-12 text-muted-foreground">Loading order...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="text-center py-12 text-muted-foreground">Order not found</div>
      </div>
    )
  }

  const availableTransitions = STATUS_TRANSITIONS[order.status] || []

  return (
    <div className="max-w-5xl mx-auto px-6 py-12">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Order Details</h1>
          <p className="text-slate-600 text-lg">Order ID: {order.id.slice(0, 8)}</p>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{order.patient.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date of Birth</p>
              <p className="font-medium">{formatDate(order.patient.dateOfBirth)}</p>
            </div>
            {order.patient.phone && (
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium">{order.patient.phone}</p>
              </div>
            )}
            {order.patient.email && (
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{order.patient.email}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Total Cost</p>
              <p className="text-2xl font-bold">${(order.totalCents / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Placed At</p>
              <p className="font-medium">{formatDateTime(order.placedAt)}</p>
            </div>
            {order.estimatedReadyAt && (
              <div>
                <p className="text-sm text-muted-foreground">Estimated Ready</p>
                <p className="font-medium">{formatDate(order.estimatedReadyAt)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-3xl shadow-lg mb-6">
        <CardHeader>
          <CardTitle>Ordered Tests</CardTitle>
          <CardDescription>Tests included in this order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Test Name</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Turnaround</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono font-medium">{item.test.code}</TableCell>
                    <TableCell>{item.test.name}</TableCell>
                    <TableCell>${(item.unitPriceCents / 100).toFixed(2)}</TableCell>
                    <TableCell>{item.turnaroundDaysAtOrder} days</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {availableTransitions.length > 0 && (
        <Card className="rounded-3xl shadow-lg">
          <CardHeader>
            <CardTitle>Update Status</CardTitle>
            <CardDescription>Change the order status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              {availableTransitions.map((transition) => (
                <Button
                  key={transition.status}
                  onClick={() => updateStatus.mutate(transition.status)}
                  disabled={updateStatus.isPending}
                  variant={transition.status === "CANCELLED" ? "destructive" : "default"}
                  className="rounded-xl"
                >
                  {transition.label}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
