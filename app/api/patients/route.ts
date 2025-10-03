import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { patientSchema, updatePatientSchema } from "@/lib/validation/patient";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const field = searchParams.get("field") || "all";

    let whereClause: Prisma.PatientWhereInput = {};

    if (search) {
      switch (field) {
        case "name":
          whereClause = {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          };
          break;
        case "email":
          whereClause = {
            email: {
              contains: search,
              mode: "insensitive",
            },
          };
          break;
        case "phone":
          whereClause = {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          };
          break;
        case "birthdate":
          // Handle different date search formats
          const searchValue = search.trim();
          let startDate: Date;
          let endDate: Date;

          if (/^\d{4}$/.test(searchValue)) {
            // Search by year (e.g., "1990")
            startDate = new Date(`${searchValue}-01-01`);
            endDate = new Date(`${parseInt(searchValue) + 1}-01-01`);
          } else if (/^\d{1,2}\/\d{4}$/.test(searchValue) || /^\d{4}-\d{1,2}$/.test(searchValue)) {
            // Search by month/year (e.g., "03/1990" or "1990-03")
            const parts = searchValue.includes("/")
              ? searchValue.split("/")
              : searchValue.split("-");
            const [month, year] = searchValue.includes("/") ? parts : parts.reverse();
            startDate = new Date(`${year}-${month.padStart(2, "0")}-01`);
            endDate = new Date(`${year}-${month.padStart(2, "0")}-31`);
          } else if (
            /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(searchValue) ||
            /^\d{4}-\d{1,2}-\d{1,2}$/.test(searchValue)
          ) {
            // Search by full date (e.g., "03/15/1990" or "1990-03-15")
            const parts = searchValue.includes("/")
              ? searchValue.split("/")
              : searchValue.split("-");
            const [month, day, year] = searchValue.includes("/")
              ? parts
              : [parts[1], parts[2], parts[0]];
            startDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
            endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000); // Add 1 day
          } else {
            // Fallback: try to parse as a general date string
            try {
              const parsedDate = new Date(searchValue);
              if (!isNaN(parsedDate.getTime())) {
                startDate = new Date(
                  parsedDate.getFullYear(),
                  parsedDate.getMonth(),
                  parsedDate.getDate()
                );
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
              } else {
                // Invalid date format, skip birthdate search
                whereClause = {};
                break;
              }
            } catch {
              whereClause = {};
              break;
            }
          }

          whereClause = {
            dob: {
              gte: startDate,
              lt: endDate,
            },
          };
          break;
        case "all":
        default:
          // Helper function to check if search looks like a date
          const isDateSearch = (searchStr: string) => {
            return (
              /^\d{4}$/.test(searchStr) || // Year
              /^\d{1,2}\/\d{4}$/.test(searchStr) || // MM/YYYY
              /^\d{4}-\d{1,2}$/.test(searchStr) || // YYYY-MM
              /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(searchStr) || // MM/DD/YYYY
              /^\d{4}-\d{1,2}-\d{1,2}$/.test(searchStr) || // YYYY-MM-DD
              !isNaN(Date.parse(searchStr))
            ); // General date parse
          };

          const searchConditions: Prisma.PatientWhereInput[] = [
            {
              fullName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              phone: {
                contains: search,
                mode: "insensitive",
              },
            },
          ];

          // Add birthdate search if it looks like a date
          if (isDateSearch(search)) {
            const searchValue = search.trim();
            let startDate: Date;
            let endDate: Date;

            try {
              if (/^\d{4}$/.test(searchValue)) {
                // Search by year (e.g., "1990")
                startDate = new Date(`${searchValue}-01-01`);
                endDate = new Date(`${parseInt(searchValue) + 1}-01-01`);
              } else if (
                /^\d{1,2}\/\d{4}$/.test(searchValue) ||
                /^\d{4}-\d{1,2}$/.test(searchValue)
              ) {
                // Search by month/year
                const parts = searchValue.includes("/")
                  ? searchValue.split("/")
                  : searchValue.split("-");
                const [month, year] = searchValue.includes("/") ? parts : parts.reverse();
                startDate = new Date(`${year}-${month.padStart(2, "0")}-01`);
                endDate = new Date(`${year}-${month.padStart(2, "0")}-31`);
              } else if (
                /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(searchValue) ||
                /^\d{4}-\d{1,2}-\d{1,2}$/.test(searchValue)
              ) {
                // Search by full date
                const parts = searchValue.includes("/")
                  ? searchValue.split("/")
                  : searchValue.split("-");
                const [month, day, year] = searchValue.includes("/")
                  ? parts
                  : [parts[1], parts[2], parts[0]];
                startDate = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`);
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
              } else {
                // General date parsing
                const parsedDate = new Date(searchValue);
                startDate = new Date(
                  parsedDate.getFullYear(),
                  parsedDate.getMonth(),
                  parsedDate.getDate()
                );
                endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
              }

              searchConditions.push({
                dob: {
                  gte: startDate,
                  lt: endDate,
                },
              });
            } catch {
              // If date parsing fails, skip birthdate search
            }
          }

          whereClause = {
            OR: searchConditions,
          };
          break;
      }
    }

    const patients = await prisma.patient.findMany({
      where: whereClause,
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
    console.log("=== API PATIENT CREATION DEBUG ===");
    const body = await request.json();
    console.log("Received request body:", body);

    const validated = patientSchema.parse(body);
    console.log("✅ Zod validation passed:", validated);

    const createData = {
      fullName: validated.fullName,
      dob: new Date(validated.dob),
      email: validated.email || null,
      phone: validated.phone || null,
    };
    console.log("Creating patient with data:", createData);

    const patient = await prisma.patient.create({
      data: createData,
    });

    console.log("✅ Patient created in database:", patient);
    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("❌ API Error creating patient:", error);
    if (error instanceof ZodError) {
      console.error("Zod validation errors:", error.errors);
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
    console.error("[API] Database or other error:", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    console.log("=== API PATIENT UPDATE DEBUG ===");
    const body = await request.json();
    console.log("Raw request body:", body);

    const validated = updatePatientSchema.parse(body);
    console.log("✅ Zod validation passed:", validated);

    const { id, ...updateData } = validated;
    console.log("Updating patient with data:", { id, updateData });

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...updateData,
        dob: updateData.dob ? new Date(updateData.dob) : undefined,
        email:
          updateData.email !== undefined && updateData.email !== "" ? updateData.email : undefined,
        phone:
          updateData.phone !== undefined && updateData.phone !== "" ? updateData.phone : undefined,
      },
    });

    console.log("✅ Patient updated successfully:", patient);
    return NextResponse.json(patient);
  } catch (error) {
    console.error("❌ API Error updating patient:", error);
    if (error instanceof ZodError) {
      console.error("Zod validation errors:", error.errors);
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

    if ((error as { code?: string })?.code === "P2025") {
      return NextResponse.json(
        {
          errors: [
            {
              field: "id",
              message: "Patient not found",
            },
          ],
        },
        { status: 404 }
      );
    }

    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}
