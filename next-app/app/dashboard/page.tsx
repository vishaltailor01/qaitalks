import Link from "next/link"

export default async function Dashboard() {
  // Session check can be implemented via middleware
  // For now, allow access to dashboard
  // const session = await getServerSession(authOptions)
  // if (!session) {
  //   redirect("/login")
  // }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-deep-blueprint">
            QAi Talks
          </Link>
          <div className="flex gap-4 items-center">
            <Link href="/blog" className="text-slate-700 hover:text-deep-blueprint">
              Blog
            </Link>
            <Link href="/dashboard" className="text-deep-blueprint font-semibold">
              Dashboard
            </Link>
            <Link href="/api/auth/signout" className="px-4 py-2 bg-deep-blueprint text-white rounded">
              Sign Out
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-deep-blueprint text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-2">Welcome to Your Dashboard!</h1>
          <p className="text-blue-100">Track your learning progress and access resources</p>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Stats Cards */}
          {[
            { icon: "📚", label: "Blog Posts Read", value: 0 },
            { icon: "⏱️", label: "Hours Learned", value: 0 },
            { icon: "🏆", label: "Achievements", value: 0 },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="text-4xl mb-2">{stat.icon}</div>
              <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-deep-blueprint">{stat.value}</p>
            </div>
          ))}
        </div>

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
              <h3 className="text-xl font-bold text-deep-blueprint mb-2">Profile</h3>
              <p className="text-slate-600 mb-4">Manage your account settings</p>
              <div className="text-sm text-slate-500">
                <p>Email: user@example.com</p>
                <p className="mt-2 text-xs">Authentication setup coming soon...</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-deep-blueprint text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2026 QAi Talks. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}
