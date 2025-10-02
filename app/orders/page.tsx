import { OrdersTable } from "@/components/orders/orders-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default function OrdersPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Orders</h1>
          <p className="text-slate-600 text-lg">Manage lab orders and track their status</p>
        </div>
        <Link href="/orders/new">
          <Button className="rounded-xl">
            <Plus className="h-4 w-4 mr-2" />
            New Order
          </Button>
        </Link>
      </div>

      <OrdersTable />
    </div>
  )
}
