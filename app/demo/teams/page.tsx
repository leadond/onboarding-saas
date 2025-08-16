import { SimpleTeamDashboard } from '@/components/teams/simple-team-dashboard'

export default function DemoTeamsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <aside className="min-h-screen w-64 border-r border-gray-200 bg-white">
          <div className="p-6">
            <h1 className="text-xl font-bold text-gray-900">OnboardKit</h1>
            <p className="text-sm text-gray-500 mt-1">Demo Mode</p>
          </div>
          <nav className="px-6">
            <div className="space-y-2">
              <a
                href="/demo/teams"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-900 bg-gray-100"
              >
                Teams
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Kits
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clients
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Analytics
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Integrations
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Branding
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Billing
              </a>
              <a
                href="#"
                className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Settings
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
              <p className="text-gray-600">
                Manage your organization teams and collaborate with members
              </p>
            </div>

            <SimpleTeamDashboard />
          </div>
        </main>
      </div>
    </div>
  )
}