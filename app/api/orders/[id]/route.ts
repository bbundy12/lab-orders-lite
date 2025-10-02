import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { updateOrderStatusSchema } from "@/lib/validation/order"
import { ZodError } from "zod"

const VALID_TRANSITIONS: Record<string, string[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["READY"],
  READY: [],
  CANCELLED: [],
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        patient: true,
        items: {
          include: {
            test: true,
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("[v0] Error fetching order:", error)
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateOrderStatusSchema.parse(body)

    const currentOrder = await prisma.order.findUnique({
      where: { id },
    })

    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const allowedTransitions = VALID_TRANSITIONS[currentOrder.status]
    if (!allowedTransitions.includes(validated.status)) {
      return NextResponse.json(
        { error: `Cannot transition from ${currentOrder.status} to ${validated.status}` },
        { status: 400 },
      )
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: validated.status },
      include: {
        patient: true,
        items: {
          include: {
            test: true,
          },
        },
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      )
    }
    console.error("[v0] Error updating order:", error)
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 })
  }
}
