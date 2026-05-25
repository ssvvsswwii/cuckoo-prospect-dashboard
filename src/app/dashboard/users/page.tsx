import { getSessionUser, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import UsersTable from '@/components/ui/UsersTable'

export const dynamic = 'force-dynamic'

export default async function UsersPage() {
  const user = getSessionUser()!
  const supabase = createAdminClient()

  const { data: me } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (me?.role !== 'admin') redirect('/dashboard')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*, branch:branches(name)')
    .order('created_at', { ascending: false })

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('name')

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">User Management</h1>
        <p className="text-gray-500 text-sm mt-1">Approve, activate, or manage dashboard users</p>
      </div>

      {(() => {
        const pending = profiles?.filter(p => p.status === 'pending').length ?? 0
        return pending > 0 ? (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-center gap-3">
            <span className="text-yellow-600 text-xl">⏳</span>
            <div>
              <p className="text-yellow-800 font-semibold text-sm">{pending} pending approval{pending > 1 ? 's' : ''}</p>
              <p className="text-yellow-600 text-xs">Review and activate new user requests below</p>
            </div>
          </div>
        ) : null
      })()}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <UsersTable profiles={profiles ?? []} branches={branches ?? []} currentUserId={user.id} />
      </div>
    </div>
  )
}
