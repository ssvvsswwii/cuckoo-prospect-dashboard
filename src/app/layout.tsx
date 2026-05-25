import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CUCKOO – Prospect Dashboard',
  description: 'Internal prospect management system',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
