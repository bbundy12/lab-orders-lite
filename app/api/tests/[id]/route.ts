import { type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ZodError, z } from "zod";
import { validationErrorResponse, serverErrorResponse } from "@/lib/http";

const updateLabTestSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(200).optional(),
  priceCents: z.number().int().min(0).optional(),
  turnaroundDays: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const validated = updateLabTestSchema.parse(body);

    const labTest = await prisma.labTest.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(labTest);
  } catch (error) {
    if (error instanceof ZodError) {
      return validationErrorResponse(error);
    }
    console.error("[v0] Error updating lab test:", error);
    return serverErrorResponse("Failed to update lab test");
  }
}
