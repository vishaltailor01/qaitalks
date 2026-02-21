

import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"

import DashboardBadgesClient from "./DashboardBadgesClient"

export default async function Dashboard() {
  // Server-side authentication check
  const session = await auth()
  if (!session || !session.user) {
    redirect("/auth/signin")
  }
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Page Header */}
      <section className="bg-deep-blueprint text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard!</h1>
          <p className="text-blue-100">Track your learning progress and access resources</p>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Badges Section */}
        <DashboardBadgesClient />

        {/* Quick Links */}
        <div>
          <h2 className="text-3xl font-bold text-deep-blueprint mb-8">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/blog"
              className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition group"
            >
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-deep-blueprint mb-2 group-hover:text-logic-cyan">Engineering Blog</h3>
              <p className="text-slate-600">Read technical articles and tutorials</p>
            </Link>
            <Link
              href="/curriculum"
              className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition group"
            >
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-deep-blueprint mb-2 group-hover:text-logic-cyan">Curriculum</h3>
              <p className="text-slate-600">View the complete learning path</p>
            </Link>
            <Link
              href="/about"
              className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition group"
            >
              <div className="text-4xl mb-4">ℹ️</div>
              <h3 className="text-xl font-bold text-deep-blueprint mb-2 group-hover:text-logic-cyan">About</h3>
              <p className="text-slate-600">Learn more about QAi Talks</p>
            </Link>
            <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold text-deep-blueprint mb-2">Resources</h3>
              <p className="text-slate-600 mb-4">Access learning materials and guides</p>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
