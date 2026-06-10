'use client'

import type { DbItem } from '@/lib/types'
import { formatCountdown, getUrgencyColor } from '@/lib/parser'
import { Badge } from './ui/Badge'

interface DeadlineCardProps {
  item: DbItem
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

const urgencyConfig = {
  red: { border: 'border-l-[var(--accent-high)]', bg: 'bg-red-50/50', label: 'Urgente' },
  orange: { border: 'border-l-[var(--accent-medium)]', bg: 'bg-amber-50/50', label: 'Prossimo' },
  green: { border: 'border-l-[var(--accent-low)]', bg: 'bg-emerald-50/50', label: 'In programma' },
}

export function DeadlineCard({ item, onToggle, onDelete }: DeadlineCardProps) {
  if (!item.due_date) return null

  const urgency = getUrgencyColor(item.due_date)
  const config = urgencyConfig[urgency]
  const countdown = formatCountdown(item.due_date)

  return (
    <div
      className={`card p-4 border-l-4 ${config.border} ${config.bg} transition-all duration-200 ${
        item.is_completed ? 'opacity-50' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(item.id, !item.is_completed)}
          className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
            item.is_completed
              ? 'bg-[var(--accent-low)] border-[var(--accent-low)] scale-in'
              : 'border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5'
          }`}
          aria-label={item.is_completed ? 'Segna come non completato' : 'Segna come completato'}
        >
          {item.is_completed && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <p className={`text-sm leading-relaxed ${item.is_completed ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'}`}>
            {item.description}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <Badge variant="category" color={item.category} />
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {config.label}
            </span>
            <span className="text-xs font-medium text-[var(--text-secondary)]">
              {(() => {
                const time = item.due_date!.slice(11, 16)
                const dateStr = item.due_date!.slice(0, 10)
                const parts = dateStr.split('-')
                const months = ['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic']
                const formatted = `${parseInt(parts[2])} ${months[parseInt(parts[1]) - 1]}`
                return time === '23:59' ? formatted : `${formatted}, ${time}`
              })()}
            </span>
            <span className="text-xs text-[var(--text-tertiary)]">
              {countdown}
            </span>
          </div>
        </div>

        <button
          onClick={() => onDelete(item.id)}
          className="btn-ghost w-7 h-7 rounded-lg p-0 flex-shrink-0 hover:text-[var(--accent-high)]"
          aria-label="Elimina scadenza"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  )
}
