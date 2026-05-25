'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Branch } from '@/lib/types'

export default function BranchesPanel({ branches, isAdmin }: { branches: Branch[]; isAdmin: boolean }) {
  const router = useRouter()
  const [newName, setNewName] = useState('')
  const [adding, setAdding]   = useState(false)
  const [error, setError]     = useState('')

  async function addBranch() {
    if (!newName.trim()) return
    setAdding(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.from('branches').insert({ name: newName.trim() })
    if (error) setError(error.message)
    else { setNewName(''); router.refresh() }
    setAdding(false)
  }

  async function deleteBranch(id: string) {
    if (!confirm('Delete this branch? Prospects linked to it will remain.')) return
    const supabase = createClient()
    await supabase.from('branches').delete().eq('id', id)
    router.refresh()
  }

  return (
    <div className="p-6">
      {isAdmin && (
        <div className="flex gap-3 mb-6">
          <input
            type="text" value={newName} onChange={e => setNewName(e.target.value)}
            placeholder="New branch name…"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            onKeyDown={e => e.key === 'Enter' && addBranch()}
          />
          <button onClick={addBranch} disabled={adding}
            className="bg-brand hover:bg-brand-dark text-white text-sm font-bold px-5 py-2.5 rounded-lg transition-colors disabled:opacity-60">
            {adding ? 'Adding…' : '+ Add Branch'}
          </button>
        </div>
      )}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

      <div className="space-y-2">
        {branches.length === 0 && <p className="text-gray-400 text-sm py-8 text-center">No branches yet</p>}
        {branches.map(b => (
          <div key={b.id} className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-semibold text-gray-900 text-sm">{b.name}</p>
              <p className="text-xs text-gray-400">Added {new Date(b.created_at).toLocaleDateString('en-MY')}</p>
            </div>
            {isAdmin && (
              <button onClick={() => deleteBranch(b.id)}
                className="text-xs text-red-500 hover:text-red-700 font-semibold">
                Delete
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
