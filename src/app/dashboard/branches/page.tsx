import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import BranchesPanel from '@/components/ui/BranchesPanel'

export const dynamic = 'force-dynamic'

export default async function BranchesPage() {
  const supabase = createClient()
  const user = (await import('@/lib/supabase/server')).getSessionUser()!

  const { data: me } = await supabase.from('profiles').select('role').eq('id', user!.id).single()
  if (!['admin', 'branch_manager'].includes(me?.role)) redirect('/dashboard')

  const { data: branches } = await supabase
    .from('branches')
    .select('*')
    .order('name')

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Branches</h1>
        <p className="text-gray-500 text-sm mt-1">Manage CUCKOO branch offices</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <BranchesPanel branches={branches ?? []} isAdmin={me?.role === 'admin'} />
      </div>
    </div>
  )
}
