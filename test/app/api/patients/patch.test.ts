import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";

vi.mock("@/lib/prisma", async () => {
  const { prismaMock } = await import("@/test/utils/prisma");
  return { prisma: prismaMock };
});

import { PATCH } from "@/app/api/patients/route";
import { prismaMock, resetPrismaMock } from "@/test/utils/prisma";

const silenceConsole = () => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
};

const buildRequest = (body: unknown) =>
  ({
    json: vi.fn().mockResolvedValue(body),
  } as unknown as NextRequest);

describe("PATCH /api/patients", () => {
  beforeEach(() => {
    resetPrismaMock();
    vi.restoreAllMocks();
    silenceConsole();
  });

  it("updates patient when payload is valid", async () => {
    const payload = {
      id: "patient-123",
      fullName: "Updated Name",
      dob: "1990-01-01",
      email: "updated@example.com",
      phone: "(555) 123-4567",
    };
    const now = new Date("2025-01-01T00:00:00.000Z");

    prismaMock.patient.update.mockResolvedValue({
      id: payload.id,
      fullName: payload.fullName,
      dob: new Date(payload.dob),
      email: payload.email,
      phone: payload.phone,
      createdAt: now,
      updatedAt: now,
    });

    const response = await PATCH(buildRequest(payload));

    expect(prismaMock.patient.update).toHaveBeenCalledWith({
      where: { id: payload.id },
      data: {
        fullName: payload.fullName,
        dob: new Date(payload.dob),
        email: payload.email,
        phone: payload.phone,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({
      id: payload.id,
      fullName: payload.fullName,
      dob: new Date(payload.dob).toISOString(),
      email: payload.email,
      phone: payload.phone,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });
  });

  it("omits optional fields when payload contains empty strings", async () => {
    const payload = {
      id: "patient-456",
      fullName: "Another Name",
      dob: "1988-05-10",
      email: "",
      phone: "",
    };

    prismaMock.patient.update.mockResolvedValue({
      id: payload.id,
      fullName: payload.fullName,
      dob: new Date(payload.dob),
      email: null,
      phone: null,
      createdAt: new Date("2025-02-01T00:00:00.000Z"),
      updatedAt: new Date("2025-02-02T00:00:00.000Z"),
    });

    const response = await PATCH(buildRequest(payload));

    expect(prismaMock.patient.update).toHaveBeenCalledWith({
      where: { id: payload.id },
      data: {
        fullName: payload.fullName,
        dob: new Date(payload.dob),
        email: undefined,
        phone: undefined,
      },
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.email).toBeNull();
    expect(data.phone).toBeNull();
  });

  it("returns validation error when no fields provided", async () => {
    const payload = {
      id: "patient-789",
    };

    const response = await PATCH(buildRequest(payload));

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.errors).toBeDefined();
    expect(
      data.errors.some((error: { message: string }) => error.message.includes("No fields"))
    ).toBe(true);
    expect(prismaMock.patient.update).not.toHaveBeenCalled();
  });

  it("returns 404 when patient does not exist", async () => {
    const payload = {
      id: "missing-patient",
      fullName: "Ghost",
    };

    prismaMock.patient.update.mockRejectedValue(
      Object.assign(new Error("Not found"), { code: "P2025" })
    );

    const response = await PATCH(buildRequest(payload));

    expect(response.status).toBe(404);
    const data = await response.json();
    expect(data.errors?.[0]?.field).toBe("id");
  });

  it("returns 500 on unexpected errors", async () => {
    const payload = {
      id: "patient-500",
      fullName: "Broken",
      dob: "1991-04-11",
    };

    prismaMock.patient.update.mockRejectedValue(new Error("database offline"));

    const response = await PATCH(buildRequest(payload));

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe("Failed to update patient");
  });
});
