'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/dashboard', label: 'Bacheca' },
  { href: '/calendar', label: 'Calendario' },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`
              px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'text-[var(--accent-primary)] bg-[var(--accent-primary)]/10'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
              }
            `}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
