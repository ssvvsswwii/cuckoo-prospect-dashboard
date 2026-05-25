'use server'

import { getSessionUser, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Role, UserStatus } from '@/lib/types'

// ─── Prospects ────────────────────────────────────────────────────────────────

export async function updateProspectStatus(
  prospectId: string,
  newStatus:  string,
  oldStatus:  string,
  prospectName: string,
) {
  const user = getSessionUser()
  if (!user) throw new Error('Not authenticated')

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
  const user = getSessionUser()
  if (!user) throw new Error('Not authenticated')

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
  const user = getSessionUser()
  if (!user) throw new Error('Not authenticated')

  const db = createAdminClient()
  await db.from('profiles').update(updates).eq('id', targetId)

  // Log status changes (approvals / deactivations)
  if (updates.status) {
    const action = updates.status === 'active' ? 'user_approved' : 'user_deactivated'
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
