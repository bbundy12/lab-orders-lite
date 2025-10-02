import { OrderForm } from "@/components/orders/order-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function NewOrderPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/orders">
        <Button variant="ghost" className="mb-6 rounded-xl">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </Link>

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Create Order</h1>
        <p className="text-slate-600 text-lg">Select patient and tests to create a new lab order</p>
      </div>

      <OrderForm />
    </div>
  )
}
