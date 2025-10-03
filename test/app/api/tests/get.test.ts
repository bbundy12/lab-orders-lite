import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

import { GET } from "@/app/api/tests/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";

const buildRequest = (params: Record<string, string | undefined>) => {
  const url = new URL("https://example.com/api/tests");
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return { nextUrl: url } as unknown as NextRequest;
};

describe("GET /api/tests", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns all tests when activeOnly is not set", async () => {
    const tests = [
      {
        id: "test-1",
        code: "A1",
        name: "Panel",
        priceCents: 1000,
        turnaroundDays: 2,
        isActive: true,
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ];
    prismaMock.labTest.findMany.mockResolvedValue(
      tests.map((test) => ({
        ...test,
        createdAt: new Date(test.createdAt),
        updatedAt: new Date(test.updatedAt),
      }))
    );

    const response = await GET(buildRequest({}));
    expect(prismaMock.labTest.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { code: "asc" },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(tests);
  });

  it("filters active tests when activeOnly=1", async () => {
    prismaMock.labTest.findMany.mockResolvedValue([]);

    await GET(buildRequest({ activeOnly: "1" }));

    expect(prismaMock.labTest.findMany).toHaveBeenCalledWith({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });
  });

  it("returns 500 when prisma throws", async () => {
    prismaMock.labTest.findMany.mockRejectedValue(new Error("database error"));

    const response = await GET(buildRequest({}));
    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to fetch tests");
  });
});
