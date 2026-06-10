'use client'

import type { ItemCategory, ItemPriority } from '@/lib/types'

interface BadgeProps {
  children?: React.ReactNode
  variant?: 'category' | 'priority' | 'default'
  color?: ItemCategory | ItemPriority | string
}

const categoryColors: Record<ItemCategory, string> = {
  task: 'bg-blue-50 text-blue-700',
  deadline: 'bg-red-50 text-red-700',
  shopping: 'bg-emerald-50 text-emerald-700',
  reminder: 'bg-purple-50 text-purple-700',
}

const categoryLabels: Record<ItemCategory, string> = {
  task: 'Task',
  deadline: 'Scadenza',
  shopping: 'Spesa',
  reminder: 'Promemoria',
}

const priorityColors: Record<ItemPriority, string> = {
  high: 'bg-red-50 text-[var(--accent-high)]',
  medium: 'bg-amber-50 text-[var(--accent-medium)]',
  low: 'bg-emerald-50 text-[var(--accent-low)]',
}

const priorityLabels: Record<ItemPriority, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Bassa',
}

export function Badge({ children, variant = 'default', color }: BadgeProps) {
  const base = 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium'

  let colorClass = ''
  if (variant === 'category' && color && color in categoryColors) {
    colorClass = categoryColors[color as ItemCategory]
  } else if (variant === 'priority' && color && color in priorityColors) {
    colorClass = priorityColors[color as ItemPriority]
  }

  return (
    <span className={`${base} ${colorClass}`}>
      {variant === 'category' && color ? categoryLabels[color as ItemCategory] ?? children
        : variant === 'priority' && color ? priorityLabels[color as ItemPriority] ?? children
        : children}
    </span>
  )
}
