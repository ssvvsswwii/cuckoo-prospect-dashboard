import { getSessionUser, createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

const ACTION_CONFIG: Record<string, { label: string; dot: string; textColor: string }> = {
  prospect_registered: { label: 'New Registration', dot: 'bg-green-500',  textColor: 'text-green-700'  },
  status_changed:      { label: 'Status Changed',   dot: 'bg-blue-500',   textColor: 'text-blue-700'   },
  user_approved:       { label: 'User Approved',    dot: 'bg-brand',      textColor: 'text-brand'      },
  user_deactivated:    { label: 'User Deactivated', dot: 'bg-red-500',    textColor: 'text-red-600'    },
}

const STATUS_LABELS: Record<string, string> = {
  new:         'New',
  contacted:   'Contacted',
  in_progress: 'In Progress',
  converted:   'Converted',
  lost:        'Lost',
}

function timeAgo(dateStr: string) {
  const diff  = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  if (mins  < 1)  return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  < 7)  return `${days}d ago`
  return new Date(dateStr).toLocaleDateString('en-GB')
}

function describe(log: any): { primary: string; secondary: string | null } {
  const actor = log.user?.full_name || log.user?.email || 'System'
  switch (log.action) {
    case 'prospect_registered':
      return {
        primary:   `New prospect registered: ${log.entity_name}`,
        secondary: log.meta?.source ? `Source: ${log.meta.source}` : null,
      }
    case 'status_changed': {
      const from = STATUS_LABELS[log.meta?.from] ?? log.meta?.from ?? '?'
      const to   = STATUS_LABELS[log.meta?.to]   ?? log.meta?.to   ?? '?'
      return {
        primary:   `${actor} updated ${log.entity_name}`,
        secondary: `${from} → ${to}`,
      }
    }
    case 'user_approved':
      return { primary: `${actor} approved ${log.entity_name}`, secondary: null }
    case 'user_deactivated':
      return { primary: `${actor} deactivated ${log.entity_name}`, secondary: null }
    default:
      return { primary: log.action, secondary: null }
  }
}

export default async function ActivityPage() {
  const user = getSessionUser()
  if (!user) redirect('/auth/login')

  const supabase = createAdminClient()
  const { data: logs } = await supabase
    .from('activity_logs')
    .select('*, user:profiles(full_name, email)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Activity Log</h1>
        <p className="text-gray-500 text-sm mt-1">Recent actions across the dashboard</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {!logs || logs.length === 0 ? (
          <div className="px-6 py-16 text-center text-gray-400">
            <p className="text-4xl mb-3">📋</p>
            <p className="font-semibold text-gray-500">No activity yet</p>
            <p className="text-sm mt-1">Actions will appear here as the team uses the dashboard</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(logs as any[]).map((log, i) => {
              const cfg = ACTION_CONFIG[log.action] ?? {
                label: log.action, dot: 'bg-gray-400', textColor: 'text-gray-600',
              }
              const { primary, secondary } = describe(log)
              const isLast = i === logs.length - 1

              return (
                <div key={log.id} className="flex gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  {/* Timeline dot + line */}
                  <div className="flex flex-col items-center pt-1.5 gap-1">
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} />
                    {!isLast && <div className="w-px flex-1 min-h-[16px] bg-gray-100" />}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <span className={`text-xs font-bold uppercase tracking-wide ${cfg.textColor}`}>
                          {cfg.label}
                        </span>
                        <p className="text-sm font-medium text-gray-900 mt-0.5 truncate">{primary}</p>
                        {secondary && (
                          <p className="text-xs text-gray-500 mt-0.5">{secondary}</p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 mt-0.5">
                        {timeAgo(log.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
