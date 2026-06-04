'use server'

import { getSessionUser, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Role, UserStatus } from '@/lib/types'

// ─── Auth guard ───────────────────────────────────────────────────────────────
// Verifies the cookie user exists AND their profile is still active.
async function requireActiveUser() {
  const user = getSessionUser()
  if (!user) throw new Error('Not authenticated')

  const db = createAdminClient()
  const { data: profile } = await db
    .from('profiles')
    .select('status, role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'active') throw new Error('Account not active')

  return { user, role: profile.role as Role }
}

// ─── Prospects ────────────────────────────────────────────────────────────────

export async function updateProspectStatus(
  prospectId: string,
  newStatus:  string,
  oldStatus:  string,
  prospectName: string,
) {
  const { user } = await requireActiveUser()
  const db = createAdminClient()

  await db
    .from('prospects')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', prospectId)

  await db.from('activity_logs').insert({
    user_id:     user.id,
    action:      'status_changed',
    entity_type: 'prospect',
    entity_id:   prospectId,
    entity_name: prospectName,
    meta:        { from: oldStatus, to: newStatus },
  })

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/activity')
}

export async function updateProspectNotes(
  prospectId: string,
  notes: string,
) {
  const { user } = await requireActiveUser()
  const db = createAdminClient()

  await db
    .from('prospects')
    .update({ notes, updated_at: new Date().toISOString() })
    .eq('id', prospectId)

  revalidatePath('/dashboard')
}

// ─── Users ────────────────────────────────────────────────────────────────────

export async function updateUser(
  targetId: string,
  updates: Partial<{ status: UserStatus; role: Role; branch_id: string }>,
  targetName: string,
) {
  const { role } = await requireActiveUser()

  // Only admins may manage users
  if (role !== 'admin') throw new Error('Forbidden')

  const db = createAdminClient()
  await db.from('profiles').update(updates).eq('id', targetId)

  if (updates.status) {
    const action = updates.status === 'active' ? 'user_approved' : 'user_deactivated'
    const { user } = await requireActiveUser()
    await db.from('activity_logs').insert({
      user_id:     user.id,
      action,
      entity_type: 'user',
      entity_id:   targetId,
      entity_name: targetName,
      meta:        { new_status: updates.status },
    })
  }

  revalidatePath('/dashboard/users')
  revalidatePath('/dashboard/activity')
}
