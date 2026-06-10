'use client'

import { useMemo } from 'react'
import { format, addDays } from 'date-fns'
import type { DbItem } from '@/lib/types'
import { TaskCard } from './TaskCard'
import { DeadlineCard } from './DeadlineCard'
import { ShoppingList } from './ShoppingList'
import { EmptyState } from './EmptyState'
import { formatDateItalian } from '@/lib/parser'

interface DashboardColumnsProps {
  items: DbItem[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function DashboardColumns({ items, onToggle, onDelete }: DashboardColumnsProps) {
  const todayItems = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    return items.filter((item) => {
      if (item.is_completed) return false
      if (item.category === 'shopping') return false
      if (item.due_date) {
        if (item.due_date.slice(0, 10) === todayStr) return true
      } else {
        return true
      }
      if (item.priority === 'high') return true
      return false
    })
  }, [items])

  const deadlineItems = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const weekFromNowStr = format(addDays(new Date(), 7), 'yyyy-MM-dd')
    return items.filter((item) => {
      if (item.is_completed) return false
      if (item.category === 'shopping') return false
      if (!item.due_date) return false
      const itemDate = item.due_date.slice(0, 10)
      return itemDate >= todayStr && itemDate <= weekFromNowStr
    }).sort((a, b) => {
      if (!a.due_date || !b.due_date) return 0
      return a.due_date.localeCompare(b.due_date)
    })
  }, [items])

  const shoppingItems = useMemo(() => {
    return items.filter((item) => item.category === 'shopping')
  }, [items])

  const todayFormatted = formatDateItalian(new Date().toISOString())

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Column
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
        title="Oggi"
        subtitle={todayFormatted}
        count={todayItems.length}
        accentColor="var(--accent-primary)"
      >
        {todayItems.length === 0 ? (
          <EmptyState title="Nessun impegno urgente per oggi" description="Goditi la giornata!" />
        ) : (
          <div className="space-y-2">
            {todayItems.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </Column>

      <Column
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title="In scadenza"
        count={deadlineItems.length}
        accentColor="var(--accent-medium)"
      >
        {deadlineItems.length === 0 ? (
          <EmptyState title="Nessuna scadenza imminente" description="Tutto sotto controllo" />
        ) : (
          <div className="space-y-2">
            {deadlineItems.map((item) => (
              <DeadlineCard
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </Column>

      <Column
        icon={
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        }
        title="Lista Spesa"
        count={shoppingItems.filter((i) => !i.is_completed).length}
        accentColor="var(--accent-low)"
      >
        {shoppingItems.length === 0 ? (
          <EmptyState title="Lista spesa vuota" description="Aggiungi item con 'Comprare...'" />
        ) : (
          <ShoppingList
            items={shoppingItems}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        )}
      </Column>
    </div>
  )
}

function Column({
  icon,
  title,
  subtitle,
  count,
  accentColor,
  children,
}: {
  icon: React.ReactNode
  title: string
  subtitle?: string
  count: number
  accentColor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base font-semibold text-[var(--text-primary)]">
              {title}
            </h2>
            {subtitle && (
              <p className="text-xs text-[var(--text-tertiary)]">{subtitle}</p>
            )}
          </div>
        </div>
        <span
          className="text-xs font-semibold px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
        >
          {count}
        </span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  )
}
