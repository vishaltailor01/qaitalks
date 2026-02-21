import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  let session = await auth()
  // Dev-only bypass: allow testing without OAuth when DEV_AUTH_BYPASS is enabled
  if (!session?.user?.id && process.env.DEV_AUTH_BYPASS === '1' && process.env.DEV_TEST_USER_ID) {
    session = { user: { id: process.env.DEV_TEST_USER_ID } } as any
  }
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prisma = getPrisma()
  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  if (!profile) return NextResponse.json({})
  return NextResponse.json(profile)
}

export async function POST(req: Request) {
  try {
    let session = await auth()
    // Dev-only bypass: allow testing without OAuth when DEV_AUTH_BYPASS is enabled
    if (!session?.user?.id && process.env.DEV_AUTH_BYPASS === '1' && process.env.DEV_TEST_USER_ID) {
      session = { user: { id: process.env.DEV_TEST_USER_ID } } as any
    }
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const data = await req.json()
    const prisma = getPrisma()

    const stringifyIfNeeded = (val: any) => {
      if (val === undefined || val === null) return null
      return typeof val === 'string' ? val : JSON.stringify(val)
    }

    // Ensure a minimal User row exists for the session user (helps dev-bypass and new users)
    await prisma.user.upsert({
      where: { id: session.user.id },
      update: {},
      create: { id: session.user.id, email: `${session.user.id}@dev.local` },
    })

    const existing = await prisma.profile.findUnique({ where: { userId: session.user.id } })
    if (existing) {
      const updated = await prisma.profile.update({
        where: { userId: session.user.id },
        data: {
          image: data.image ?? existing.image,
          about: data.about ?? existing.about,
          experience: data.experience !== undefined ? stringifyIfNeeded(data.experience) : existing.experience,
          skills: data.skills !== undefined ? stringifyIfNeeded(data.skills) : existing.skills,
          licenses: data.licenses !== undefined ? stringifyIfNeeded(data.licenses) : existing.licenses,
        },
      })
      return NextResponse.json(updated)
    }

    const created = await prisma.profile.create({
      data: {
        userId: session.user.id,
        image: data.image || null,
        about: data.about || null,
        experience: stringifyIfNeeded(data.experience),
        skills: stringifyIfNeeded(data.skills),
        licenses: stringifyIfNeeded(data.licenses),
      },
    })

    return NextResponse.json(created)
  } catch (err: any) {
    // Log full error server-side, but return a generic message to clients.
    console.error('Profile POST error', err)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
