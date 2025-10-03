import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

vi.mock("@/lib/calculations", () => ({
  calcTotal: vi.fn(() => 4000),
  calcEta: vi.fn(() => new Date("2025-01-05T00:00:00.000Z")),
}));

import { POST } from "@/app/api/orders/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";
import { calcTotal, calcEta } from "@/lib/calculations";

const buildRequest = (body: unknown) =>
  ({
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest);

describe("POST /api/orders", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.clearAllMocks();
  });

  it("creates order when payload is valid", async () => {
    const payload = {
      patientId: "patient-1",
      items: [
        { labTestId: "test-1", unitPriceCents: 1500, turnaroundDaysAtOrder: 2 },
        { labTestId: "test-2", unitPriceCents: 2500, turnaroundDaysAtOrder: 3 },
      ],
    };

    prismaMock.order.create.mockResolvedValue({
      id: "order-1",
      patientId: payload.patientId,
      status: "DRAFT",
      totalCents: 4000,
      placedAt: new Date("2025-01-01T00:00:00.000Z"),
      estimatedReadyAt: new Date("2025-01-05T00:00:00.000Z"),
      items: [],
      patient: { id: "patient-1", fullName: "Alice" },
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
      updatedAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    const response = await POST(buildRequest(payload));

    expect(calcTotal).toHaveBeenCalledWith(payload.items);
    expect(calcEta).toHaveBeenCalled();
    expect(prismaMock.order.create).toHaveBeenCalledWith({
      data: {
        patientId: payload.patientId,
        status: "DRAFT",
        totalCents: 4000,
        placedAt: expect.any(Date),
        estimatedReadyAt: new Date("2025-01-05T00:00:00.000Z"),
        items: {
          create: payload.items.map((item) => ({
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

    expect(response.status).toBe(201);
  });

  it("returns validation error when payload is invalid", async () => {
    const payload = {
      patientId: "",
      items: [],
    };

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.errors).toBeDefined();
    expect(prismaMock.order.create).not.toHaveBeenCalled();
  });

  it("returns 500 when prisma throws", async () => {
    const payload = {
      patientId: "patient-1",
      items: [{ labTestId: "test-1", unitPriceCents: 1500, turnaroundDaysAtOrder: 2 }],
    };

    prismaMock.order.create.mockRejectedValue(new Error("database error"));

    const response = await POST(buildRequest(payload));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to create order");
  });
});
