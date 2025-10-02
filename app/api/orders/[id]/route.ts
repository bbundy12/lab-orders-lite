import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ZodError, z } from "zod";
import { validationErrorResponse, serverErrorResponse, notFoundResponse } from "@/lib/http";
import { updateOrderStatusSchema } from "@/lib/validation/order";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        patient: true,
        items: {
          include: {
            labTest: true,
          },
        },
      },
    });

    if (!order) {
      return notFoundResponse("Order not found");
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("[v0] Error fetching order:", error);
    return serverErrorResponse("Failed to fetch order");
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateOrderStatusSchema.parse(body);

    // First check if order exists
    const existingOrder = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!existingOrder) {
      return notFoundResponse("Order not found");
    }

    // Validate status transition
    const validTransitions = {
      DRAFT: ["SUBMITTED", "CANCELLED"],
      SUBMITTED: ["IN_PROGRESS", "CANCELLED"],
      IN_PROGRESS: ["READY"],
      READY: [], // No transitions allowed from READY
      CANCELLED: [], // No transitions allowed from CANCELLED
    };

    const currentStatus = existingOrder.status;
    const newStatus = validated.status;

    if (!validTransitions[currentStatus].includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${newStatus}`,
          validTransitions: validTransitions[currentStatus],
        },
        { status: 400 }
      );
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status: newStatus },
      include: {
        patient: true,
        items: {
          include: {
            labTest: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    console.error("[v0] Error updating order:", error);
    return serverErrorResponse("Failed to update order");
  }
}
