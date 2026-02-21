import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET() {
  let session = await auth()
  if (!session?.user?.id && process.env.DEV_AUTH_BYPASS === '1' && process.env.DEV_TEST_USER_ID) {
    session = { user: { id: process.env.DEV_TEST_USER_ID } } as any
  }
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const prisma = getPrisma()
  const badges = await prisma.badge.findMany({ where: { userId: session.user.id }, include: { course: true }, orderBy: { awardedAt: 'desc' } })

  return NextResponse.json({ badges })
}