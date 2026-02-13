import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getPrisma } from '@/lib/db';

// GET /api/user/data - Export all user data (GDPR)
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const prisma = getPrisma();
  // Collect all user-related data
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      accounts: true,
      sessions: true,
      // Add other relations as needed (e.g., CV reviews, blog posts)
    },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  // TODO: Add additional user-owned data (CV reviews, etc.)
  return NextResponse.json({ user });
}

// DELETE /api/user/data - Delete all user data (GDPR)
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const prisma = getPrisma();
  // Delete user and cascade to related data
  await prisma.user.delete({ where: { id: session.user.id } });
  // TODO: Delete additional user-owned data if not cascaded
  return NextResponse.json({ success: true, message: 'User data deleted' });
}
