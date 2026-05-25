'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Profile } from '@/lib/types'

const navItems = (role: string) => {
  const base = [
    { href: '/dashboard',          label: 'Prospects',  icon: '👥' },
    { href: '/dashboard/qr-code',  label: 'QR Code',    icon: '📱' },
  ]
  if (role === 'branch_manager' || role === 'admin') {
    base.push({ href: '/dashboard/branches', label: 'Branches', icon: '🏢' })
  }
  if (role === 'admin') {
    base.push({ href: '/dashboard/users', label: 'Users', icon: '🔐' })
  }
  return base
}

const roleLabel: Record<string, string> = {
  admin:              'Admin',
  branch_manager:     'Branch Manager',
  client_consultant:  'Client Consultant',
}

export default function Sidebar({ profile }: { profile: Profile & { branch?: { name: string } } }) {
  const pathname = usePathname()

  async function signOut() {
    await fetch('/api/auth/set-session', { method: 'DELETE' })
    window.location.href = '/auth/login'
  }

  return (
    <aside className="w-64 bg-brand flex flex-col h-full shrink-0">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-white/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 border border-white/40 flex items-center justify-center text-white font-extrabold text-lg">C</div>
          <div>
            <div className="text-white font-extrabold tracking-widest text-sm">CUCKOO</div>
            <div className="text-white/60 text-xs">Prospect Dashboard</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {navItems(profile.role).map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors
                ${active
                  ? 'bg-white text-brand'
                  : 'text-white/80 hover:bg-white/10 hover:text-white'}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User info */}
      <div className="px-4 py-5 border-t border-white/20">
        <div className="mb-3">
          <p className="text-white font-semibold text-sm truncate">{profile.full_name || profile.email}</p>
          <p className="text-white/60 text-xs">{roleLabel[profile.role]}</p>
          {profile.branch && <p className="text-white/50 text-xs">{profile.branch.name}</p>}
        </div>
        <button onClick={signOut}
          className="w-full text-sm text-white/70 hover:text-white border border-white/20 hover:border-white/50 rounded-lg py-2 transition-colors font-medium">
          Sign Out
        </button>
      </div>
    </aside>
  )
}
