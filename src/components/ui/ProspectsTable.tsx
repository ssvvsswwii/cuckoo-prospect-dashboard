'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Prospect, Profile, ProspectStatus } from '@/lib/types'
import { updateProspectStatus, updateProspectNotes } from '@/app/dashboard/actions'

const STATUS_STYLES: Record<ProspectStatus, string> = {
  new:         'bg-blue-100 text-blue-700',
  contacted:   'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-purple-100 text-purple-700',
  converted:   'bg-green-100 text-green-700',
  lost:        'bg-gray-100 text-gray-500',
}

const STATUS_LABELS: Record<ProspectStatus, string> = {
  new:         'New',
  contacted:   'Contacted',
  in_progress: 'In Progress',
  converted:   'Converted',
  lost:        'Lost',
}

export default function ProspectsTable({
  prospects,
  currentProfile,
}: {
  prospects: Prospect[]
  currentProfile: Profile
}) {
  const router = useRouter()
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState<ProspectStatus | 'all'>('all')
  const [selected, setSelected] = useState<Prospect | null>(null)
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving]   = useState(false)

  // Optimistic status overrides — update UI instantly before server confirms
  const [localStatuses, setLocalStatuses] = useState<Record<string, ProspectStatus>>({})

  const filtered = prospects.filter(p => {
    const status = localStatuses[p.id] ?? p.status
    const matchSearch = search === '' ||
      p.full_name.toLowerCase().includes(search.toLowerCase()) ||
      p.mobile_number?.includes(search) ||
      p.ic?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || status === filter
    return matchSearch && matchFilter
  })

  async function handleStatusChange(p: Prospect, newStatus: ProspectStatus) {
    const oldStatus = localStatuses[p.id] ?? p.status
    if (newStatus === oldStatus) return
    setLocalStatuses(prev => ({ ...prev, [p.id]: newStatus })) // instant UI update
    await updateProspectStatus(p.id, newStatus, oldStatus, p.full_name)
    router.refresh()
  }

  async function saveNote() {
    if (!selected) return
    setSaving(true)
    await updateProspectNotes(selected.id, noteText)
    setSaving(false)
    setSelected(null)
    router.refresh()
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex flex-wrap gap-3 items-center px-5 py-4 border-b border-gray-100">
        <input
          type="text"
          placeholder="Search name, IC, phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm flex-1 min-w-[200px] focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value as ProspectStatus | 'all')}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
        >
          <option value="all">All Statuses</option>
          {(Object.keys(STATUS_LABELS) as ProspectStatus[]).map(s => (
            <option key={s} value={s}>{STATUS_LABELS[s]}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
              {['Date', 'Full Name', 'IC', 'Mobile', 'Address', 'Employer', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-5 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-12 text-center text-gray-400">No prospects found</td>
              </tr>
            )}
            {filtered.map(p => {
              const status = localStatuses[p.id] ?? p.status
              return (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 text-gray-400 whitespace-nowrap">
                    {new Date(p.created_at).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-5 py-3 font-semibold text-gray-900 whitespace-nowrap">{p.full_name}</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{p.ic}</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{p.mobile_number}</td>
                  <td className="px-5 py-3 text-gray-600 max-w-[180px] truncate">{p.installation_address}</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{p.employer_name}</td>
                  <td className="px-5 py-3">
                    <select
                      value={status}
                      onChange={e => handleStatusChange(p, e.target.value as ProspectStatus)}
                      className={`text-xs font-semibold px-2 py-1 rounded-full border-0 cursor-pointer focus:outline-none ${STATUS_STYLES[status]}`}
                    >
                      {(Object.keys(STATUS_LABELS) as ProspectStatus[]).map(s => (
                        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={() => { setSelected(p); setNoteText(p.notes ?? '') }}
                      className="text-xs text-brand hover:underline font-semibold"
                    >
                      View / Note
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="bg-brand px-6 py-5 rounded-t-2xl flex justify-between items-center">
              <h2 className="text-white font-bold text-lg">{selected.full_name}</h2>
              <button onClick={() => setSelected(null)} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-3 text-sm">
              {([
                ['IC',             selected.ic],
                ['Date of Birth',  selected.date_of_birth],
                ['Mobile',         selected.mobile_number],
                ['Email',          selected.email],
                ['Address',        selected.installation_address],
                ['Postcode',       selected.postcode],
                ['Employer',       selected.employer_name],
                ['Emergency Name', selected.emergency_contact_name],
                ['Emergency No.',  selected.emergency_contact_number],
                ['Source',         selected.source],
                ['Submitted',      new Date(selected.created_at).toLocaleString('en-GB')],
              ] as [string, string | null][]).map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <span className="text-gray-400 w-36 shrink-0">{label}</span>
                  <span className="text-gray-900 font-medium">{value || '—'}</span>
                </div>
              ))}
              <div className="pt-3">
                <label className="block text-gray-500 mb-1 font-semibold">Notes</label>
                <textarea
                  rows={4}
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand"
                  placeholder="Add internal notes…"
                />
              </div>
              <button
                onClick={saveNote}
                disabled={saving}
                className="w-full bg-brand hover:bg-brand-dark text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-60 text-sm"
              >
                {saving ? 'Saving…' : 'Save Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
