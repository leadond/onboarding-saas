import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { SimpleTeamDashboard } from '@/components/teams/simple-team-dashboard'

export default async function TeamsPage() {
  const supabase = createClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
        <p className="text-gray-600">
          Manage your organization teams and collaborate with members
        </p>
      </div>

      <SimpleTeamDashboard />
    </div>
  )
}