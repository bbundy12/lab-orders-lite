import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

import { GET } from "@/app/api/patients/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";

const buildRequest = (searchParams: Record<string, string | undefined>) => {
  const url = new URL("https://example.com/api/patients");
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined) {
      url.searchParams.set(key, value);
    }
  });
  return { nextUrl: url } as unknown as NextRequest;
};

describe("GET /api/patients", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("returns all patients when no filters are provided", async () => {
    const patients = [
      {
        id: "patient-1",
        fullName: "Alice",
        dob: "1990-01-01T00:00:00.000Z",
        email: "alice@example.com",
        phone: "(555) 123-4567",
        createdAt: "2025-01-01T00:00:00.000Z",
        updatedAt: "2025-01-01T00:00:00.000Z",
      },
    ];
    prismaMock.patient.findMany.mockResolvedValue(
      patients.map((patient) => ({
        ...patient,
        dob: new Date(patient.dob),
        createdAt: new Date(patient.createdAt),
        updatedAt: new Date(patient.updatedAt),
      }))
    );

    const response = await GET(buildRequest({}));
    expect(prismaMock.patient.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "desc" },
    });
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(patients);
  });

  it("filters by patient name when field is name", async () => {
    prismaMock.patient.findMany.mockResolvedValue([]);

    await GET(buildRequest({ search: "Ann", field: "name" }));

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith({
      where: {
        fullName: {
          contains: "Ann",
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("filters by birthdate when provided MM/DD/YYYY", async () => {
    prismaMock.patient.findMany.mockResolvedValue([]);

    await GET(buildRequest({ search: "03/15/1990", field: "birthdate" }));

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith({
      where: {
        dob: {
          gte: new Date("1990-03-15"),
          lt: new Date("1990-03-16"),
        },
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("applies OR search for field=all including date-like input", async () => {
    prismaMock.patient.findMany.mockResolvedValue([]);

    await GET(buildRequest({ search: "1990" }));

    expect(prismaMock.patient.findMany).toHaveBeenCalledWith({
      where: {
        OR: expect.arrayContaining([
          {
            fullName: {
              contains: "1990",
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: "1990",
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: "1990",
              mode: "insensitive",
            },
          },
          expect.objectContaining({
            dob: {
              gte: new Date("1990-01-01"),
              lt: new Date("1991-01-01"),
            },
          }),
        ]),
      },
      orderBy: { createdAt: "desc" },
    });
  });

  it("returns 500 when prisma throws", async () => {
    prismaMock.patient.findMany.mockRejectedValue(new Error("database error"));

    const response = await GET(buildRequest({ search: "Ann" }));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to fetch patients");
  });
});
