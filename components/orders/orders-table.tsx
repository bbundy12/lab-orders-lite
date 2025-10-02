"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { formatDate } from "@/lib/date";
import { OrderStatusBadge } from "./order-status-badge";
import { Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/use-orders";
import { formatMoney } from "@/lib/calculations";

export function OrdersTable() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filters = {
    ...(search && { q: search }),
    ...(statusFilter !== "all" && { status: statusFilter }),
  };

  const { data: orders = [], isLoading } = useOrders(filters);

  return (
    <Card className="rounded-3xl shadow-lg">
      <CardHeader>
        <CardTitle>Orders</CardTitle>
        <CardDescription>View and manage all lab orders</CardDescription>
        <div className="flex gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by patient name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-xl">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="SUBMITTED">Submitted</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="READY">Ready</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search || statusFilter !== "all"
              ? "No orders found matching your filters"
              : "No orders yet. Create your first order."}
          </div>
        ) : (
          <div className="rounded-xl border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Tests</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Placed</TableHead>
                  <TableHead>Est. Ready</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.patient.fullName}</TableCell>
                    <TableCell className="font-mono text-sm">
                      {order.items.map((item) => item.labTest.code).join(", ")}
                    </TableCell>
                    <TableCell>{formatMoney(order.totalCents)}</TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(order.placedAt)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.estimatedReadyAt ? formatDate(order.estimatedReadyAt) : "—"}
                    </TableCell>
                    <TableCell>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="rounded-lg bg-transparent">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
