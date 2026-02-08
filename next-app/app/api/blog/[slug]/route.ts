export const dynamic = 'force-dynamic'

import { prisma } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params
    const post = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json(
        { error: "Blog post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("[BLOG_POST]", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
