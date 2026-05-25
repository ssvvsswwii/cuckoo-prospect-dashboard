'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Profile, Branch, UserStatus, Role } from '@/lib/types'

const STATUS_STYLES: Record<UserStatus, string> = {
  pending:  'bg-yellow-100 text-yellow-700',
  active:   'bg-green-100 text-green-700',
  inactive: 'bg-gray-100 text-gray-500',
}

const ROLE_LABELS: Record<Role, string> = {
  admin:             'Admin',
  branch_manager:    'Branch Manager',
  client_consultant: 'Client Consultant',
}

export default function UsersTable({
  profiles, branches, currentUserId
}: {
  profiles: (Profile & { branch?: { name: string } })[]
  branches: Branch[]
  currentUserId: string
}) {
  const router  = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  async function updateUser(id: string, updates: Partial<{ status: UserStatus; role: Role; branch_id: string }>) {
    setLoading(id)
    const supabase = createClient()
    await supabase.from('profiles').update(updates).eq('id', id)
    setLoading(null)
    router.refresh()
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
            {['Name', 'Email', 'Role', 'Branch', 'Status', 'Joined', 'Actions'].map(h => (
              <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {profiles.map(p => (
            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-5 py-3 font-semibold text-gray-900">
                {p.full_name || '—'}
                {p.id === currentUserId && <span className="ml-2 text-xs text-brand">(you)</span>}
              </td>
              <td className="px-5 py-3 text-gray-600">{p.email}</td>
              <td className="px-5 py-3">
                <select
                  value={p.role}
                  disabled={p.id === currentUserId || loading === p.id}
                  onChange={e => updateUser(p.id, { role: e.target.value as Role })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand disabled:opacity-50"
                >
                  <option value="client_consultant">Client Consultant</option>
                  <option value="branch_manager">Branch Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </td>
              <td className="px-5 py-3">
                <select
                  value={p.branch_id ?? ''}
                  disabled={loading === p.id}
                  onChange={e => updateUser(p.id, { branch_id: e.target.value || undefined })}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:border-brand disabled:opacity-50"
                >
                  <option value="">— No Branch —</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </td>
              <td className="px-5 py-3">
                <span className={`badge ${STATUS_STYLES[p.status]}`}>
                  {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                </span>
              </td>
              <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                {new Date(p.created_at).toLocaleDateString('en-MY')}
              </td>
              <td className="px-5 py-3">
                {p.id !== currentUserId && (
                  <div className="flex gap-2">
                    {p.status !== 'active' && (
                      <button
                        onClick={() => updateUser(p.id, { status: 'active' })}
                        disabled={loading === p.id}
                        className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Activate
                      </button>
                    )}
                    {p.status === 'active' && (
                      <button
                        onClick={() => updateUser(p.id, { status: 'inactive' })}
                        disabled={loading === p.id}
                        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded-lg font-semibold disabled:opacity-50"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
