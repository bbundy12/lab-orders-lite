import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ZodError, z } from "zod"

const updateTestSchema = z.object({
  isActive: z.boolean(),
})

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()
    const validated = updateTestSchema.parse(body)

    const test = await prisma.test.update({
      where: { id },
      data: { isActive: validated.isActive },
    })

    return NextResponse.json(test)
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          errors: error.errors.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 },
      )
    }
    console.error("[v0] Error updating test:", error)
    return NextResponse.json({ error: "Failed to update test" }, { status: 500 })
  }
}
