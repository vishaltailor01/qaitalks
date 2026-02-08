export const dynamic = 'force-dynamic'

import NextAuth from "next-auth/next"
import GithubProvider from "next-auth/providers/github"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { getPrisma } from "@/lib/db"

// Conditionally register providers only if credentials are set
const providers = []

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    })
  )
}

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

// If no providers are configured, warn in development
if (providers.length === 0 && process.env.NODE_ENV === 'development') {
  console.warn(
    '\n⚠️  No OAuth providers configured. Set GITHUB_ID/GITHUB_SECRET or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET in .env\n'
  )
}

export const authOptions = {
  adapter: PrismaAdapter(getPrisma()),
  providers,
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async session({ session, token, user }: { session: any; token: any; user: any }) {
      if (session.user) {
        session.user.id = user?.id || token?.sub
        session.user.role = user?.role || token?.role || "student"
      }
      return session
    },
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
