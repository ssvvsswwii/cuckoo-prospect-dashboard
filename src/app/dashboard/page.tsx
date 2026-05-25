import { getSessionUser, createAdminClient } from '@/lib/supabase/server'
import type { Prospect, Profile } from '@/lib/types'
import ProspectsTable from '@/components/ui/ProspectsTable'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = getSessionUser()!
  const supabase = createAdminClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile }

  // Build query — admin client, filter by role in code
  let query = supabase
    .from('prospects')
    .select('*, profile:profiles(full_name, email), branch:branches(name)')
    .order('created_at', { ascending: false })

  if (profile?.role === 'client_consultant') {
    query = query.eq('assigned_to', user.id)
  } else if (profile?.role === 'branch_manager') {
    query = query.eq('branch_id', profile.branch_id!)
  }
  // admin sees all

  const { data: prospects } = await query

  const total     = prospects?.length ?? 0
  const newCount  = prospects?.filter(p => p.status === 'new').length ?? 0
  const converted = prospects?.filter(p => p.status === 'converted').length ?? 0

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Prospects</h1>
        <p className="text-gray-500 text-sm mt-1">All registered leads from QR code submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Leads', value: total,     color: 'text-brand'      },
          { label: 'New',         value: newCount,  color: 'text-blue-600'   },
          { label: 'Converted',   value: converted, color: 'text-green-600'  },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
            <p className={`text-3xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <ProspectsTable prospects={(prospects ?? []) as Prospect[]} currentProfile={profile} />
      </div>
    </div>
  )
}
