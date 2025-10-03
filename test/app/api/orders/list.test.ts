import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

import { GET } from "@/app/api/orders/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";

const buildRequest = (query: Record<string, string | undefined>) => {
  const url = new URL("https://example.com/api/orders");
  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return {
    nextUrl: url,
  } as unknown as NextRequest;
};

describe("GET /api/orders", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns orders with filters applied", async () => {
    const orders = [
      {
        id: "order-1",
        patientId: "patient-1",
        status: "SUBMITTED",
        placedAt: "2025-01-01T00:00:00.000Z",
        estimatedReadyAt: "2025-01-04T00:00:00.000Z",
        totalCents: 5000,
        patient: { id: "patient-1", fullName: "Alice", email: null, phone: null },
        items: [],
      },
    ];

    prismaMock.order.findMany.mockResolvedValue(orders);

    const response = await GET(
      buildRequest({ status: "SUBMITTED", patient: "patient-1", q: "alice" })
    );

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: {
        status: "SUBMITTED",
        patientId: "patient-1",
        patient: {
          fullName: {
            contains: "alice",
            mode: "insensitive",
          },
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
      orderBy: {
        placedAt: "desc",
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual(orders);
  });

  it("handles missing optional filters", async () => {
    const orders: Array<Record<string, unknown>> = [];
    prismaMock.order.findMany.mockResolvedValue(orders);

    const response = await GET(buildRequest({}));

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: {},
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

    expect(await response.json()).toEqual(orders);
  });

  it("searches only by patient name when q is provided", async () => {
    prismaMock.order.findMany.mockResolvedValue([]);

    await GET(buildRequest({ q: "Bob" }));

    expect(prismaMock.order.findMany).toHaveBeenCalledWith({
      where: {
        patient: {
          fullName: {
            contains: "Bob",
            mode: "insensitive",
          },
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
      orderBy: {
        placedAt: "desc",
      },
    });
  });

  it("returns 500 when prisma throws", async () => {
    prismaMock.order.findMany.mockRejectedValue(new Error("database unavailable"));

    const response = await GET(buildRequest({}));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to fetch orders");
  });
});
