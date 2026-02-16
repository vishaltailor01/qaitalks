import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prisma = getPrisma()
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({})
  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const data = await req.json()
  const prisma = getPrisma()

  const existing = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (existing) {
    const updated = await prisma.profile.update({
      where: { userId: session.user.id },
      data: {
        image: data.image || existing.image,
        about: data.about || existing.about,
        experience: data.experience || existing.experience,
        skills: data.skills || existing.skills,
        licenses: data.licenses || existing.licenses,
      },
    })
    return NextResponse.json(updated)
  }

  const created = await prisma.profile.create({
    data: {
      userId: session.user.id,
      image: data.image || null,
      about: data.about || null,
      experience: data.experience || null,
      skills: data.skills || null,
      licenses: data.licenses || null,
    },
  })

  return NextResponse.json(created)
}
