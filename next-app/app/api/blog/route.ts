export const dynamic = 'force-dynamic'
export const revalidate = 0

import { getPrisma } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const prisma = getPrisma()
    const posts = await prisma.blogPost.findMany({
      where: { published: true },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json(posts)
  } catch (error) {
    console.error("[BLOG]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
