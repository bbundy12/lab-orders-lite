import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

import { PATCH } from "@/app/api/orders/[id]/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";

const buildRequest = (body: unknown) =>
  ({
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest);

const buildParams = (id: string) => Promise.resolve({ id });

describe("PATCH /api/orders/[id]", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.restoreAllMocks();
  });

  it("updates order when transition is valid", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ status: "SUBMITTED" });
    prismaMock.order.update.mockResolvedValue({ id: "order-1", status: "IN_PROGRESS" });

    const response = await PATCH(buildRequest({ status: "IN_PROGRESS" }), {
      params: buildParams("order-1"),
    });

    expect(prismaMock.order.update).toHaveBeenCalledWith({
      where: { id: "order-1" },
      data: { status: "IN_PROGRESS" },
      include: {
        patient: true,
        items: {
          include: {
            labTest: true,
          },
        },
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("IN_PROGRESS");
  });

  it("rejects invalid transitions", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ status: "READY" });

    const response = await PATCH(buildRequest({ status: "IN_PROGRESS" }), {
      params: buildParams("order-1"),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid status transition");
    expect(prismaMock.order.update).not.toHaveBeenCalled();
  });

  it("returns 404 when order not found", async () => {
    prismaMock.order.findUnique.mockResolvedValue(null);

    const response = await PATCH(buildRequest({ status: "SUBMITTED" }), {
      params: buildParams("missing"),
    });

    expect(response.status).toBe(404);
  });

  it("returns validation error for invalid payload", async () => {
    const response = await PATCH(buildRequest({ status: "INVALID" }), {
      params: buildParams("order-1"),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.errors?.[0]?.message).toBeDefined();
  });

  it("returns 500 on unexpected error", async () => {
    prismaMock.order.findUnique.mockResolvedValue({ status: "SUBMITTED" });
    prismaMock.order.update.mockRejectedValue(new Error("database offline"));

    const response = await PATCH(buildRequest({ status: "IN_PROGRESS" }), {
      params: buildParams("order-2"),
    });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to update order");
  });
});
