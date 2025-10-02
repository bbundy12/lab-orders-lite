import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { testSchema } from "@/lib/validation/test"
import { ZodError } from "zod"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const activeOnly = searchParams.get("activeOnly") === "1"

    const tests = await prisma.test.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: {
        code: "asc",
      },
    })

    return NextResponse.json(tests)
  } catch (error) {
    console.error("[v0] Error fetching tests:", error)
    return NextResponse.json({ error: "Failed to fetch tests" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = testSchema.parse(body)

    const test = await prisma.test.create({
      data: validated,
    })

    return NextResponse.json(test, { status: 201 })
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
    console.error("[v0] Error creating test:", error)
    return NextResponse.json({ error: "Failed to create test" }, { status: 500 })
  }
}
