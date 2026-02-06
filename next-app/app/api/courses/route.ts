import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const courses = await prisma.course.findMany({
      include: {
        _count: {
          select: { enrollments: true },
        },
      },
    })

    if (params.id && params.id !== "all") {
      const course = courses.find((c) => c.id === params.id)
      if (!course) {
        return NextResponse.json({ error: "Course not found" }, { status: 404 })
      }
      return NextResponse.json(course)
    }

    return NextResponse.json(courses)
  } catch (error) {
    console.error("[COURSES]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
