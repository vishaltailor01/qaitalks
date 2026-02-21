

import ProfileEditor from '@/components/ProfileEditor'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import ProfileClient from './ProfileClient'

export default async function ProfilePage() {
  // Server-side authentication check (with dev-only bypass)
  let session = await auth()
  if ((!session || !session.user) && process.env.DEV_AUTH_BYPASS === '1' && process.env.DEV_TEST_USER_ID) {
    session = { user: { id: process.env.DEV_TEST_USER_ID, name: 'Dev User' } } as any
  }
  if (!session || !session.user) {
    redirect('/auth/signin')
  }

  // Pass the user's name to the client so the read-only view can show it
  const userName = session.user.name || 'Your profile'
  return <ProfileClient userName={userName} />
}
