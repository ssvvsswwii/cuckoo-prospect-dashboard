import { getSessionUser, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/ui/Sidebar'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser()
  if (!user) redirect('/auth/login')

  // Use admin client so RLS never blocks the layout query
  const supabase = createAdminClient()
  const { data: profile } = await supabase
    .from('profiles')
    .select('*, branch:branches(name)')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'active') redirect('/auth/login')

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar profile={profile} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
