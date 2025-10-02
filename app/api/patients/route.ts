import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { patientSchema } from "@/lib/validation/patient";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";

    const patients = await prisma.patient.findMany({
      where: search
        ? {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          }
        : {},
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(patients);
  } catch (error) {
    console.error("[v0] Error fetching patients:", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = patientSchema.parse(body);

    const patient = await prisma.patient.create({
      data: {
        fullName: validated.fullName,
        dob: new Date(validated.dob),
        email: validated.email || null,
        phone: validated.phone || null,
      },
    });

    return NextResponse.json(patient, { status: 201 });
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
    console.error("[v0] Error creating patient:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
