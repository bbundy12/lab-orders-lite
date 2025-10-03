import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

import { POST } from "@/app/api/patients/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";

const buildRequest = (body: unknown) =>
  ({
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest);

describe("POST /api/patients", () => {
  beforeEach(() => {
    resetPrismaMock();
  });

  it("creates patient when payload is valid", async () => {
    const payload = {
      fullName: "Alice",
      dob: "1990-01-01",
      email: "alice@example.com",
      phone: "(555) 123-4567",
    };

    prismaMock.patient.create.mockResolvedValue({
      id: "patient-1",
      ...payload,
      dob: new Date(payload.dob),
      createdAt: new Date("2025-01-01"),
      updatedAt: new Date("2025-01-01"),
    });

    const response = await POST(buildRequest(payload));

    expect(prismaMock.patient.create).toHaveBeenCalledWith({
      data: {
        fullName: payload.fullName,
        dob: new Date(payload.dob),
        email: payload.email,
        phone: payload.phone,
      },
    });

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.id).toBe("patient-1");
  });

  it("returns validation errors when payload is invalid", async () => {
    const payload = {
      fullName: "",
      dob: "invalid-date",
    };

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.errors).toBeDefined();
    expect(prismaMock.patient.create).not.toHaveBeenCalled();
  });

  it("returns 500 when prisma throws", async () => {
    const payload = {
      fullName: "Alice",
      dob: "1990-01-01",
    };

    prismaMock.patient.create.mockRejectedValue(new Error("database error"));

    const response = await POST(buildRequest(payload));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to create patient");
  });
});
