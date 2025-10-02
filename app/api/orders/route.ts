import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createOrderSchema } from "@/lib/validation/order";
import { calcTotal, calcEta } from "@/lib/calculations";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const patientId = searchParams.get("patient");
    const search = searchParams.get("q");

    const orders = await prisma.order.findMany({
      where: {
        ...(status && { status: status as any }),
        ...(patientId && { patientId }),
        ...(search && {
          patient: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),
      },
      include: {
        patient: true,
        items: {
          include: {
            labTest: true,
          },
        },
      },
      orderBy: {
        placedAt: "desc",
      },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("[v0] Error fetching orders:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    const totalCents = calcTotal(validated.items);
    const placedAt = new Date();
    const estimatedReadyAt = calcEta(placedAt, validated.items);

    const order = await prisma.order.create({
      data: {
        patientId: validated.patientId,
        status: "DRAFT",
        totalCents,
        placedAt,
        estimatedReadyAt,
        items: {
          create: validated.items.map((item) => ({
            labTestId: item.labTestId,
            unitPriceCents: item.unitPriceCents,
            turnaroundDaysAtOrder: item.turnaroundDaysAtOrder,
          })),
        },
      },
      include: {
        patient: true,
        items: {
          include: {
            labTest: true,
          },
        },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }
    console.error("[v0] Error creating order:", error);
    return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
  }
}
