'use client'

import { useState, useMemo } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
  parseISO,
} from 'date-fns'
import { it } from 'date-fns/locale/it'
import type { DbItem } from '@/lib/types'
import { TaskCard } from './TaskCard'

interface CalendarGridProps {
  items: DbItem[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

const categoryColors: Record<string, string> = {
  task: 'var(--accent-primary)',
  deadline: 'var(--accent-high)',
  shopping: 'var(--accent-low)',
  reminder: 'var(--accent-medium)',
}

export function CalendarGrid({ items, onToggle, onDelete }: CalendarGridProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const itemsByDate = useMemo(() => {
    const map = new Map<string, DbItem[]>()
    for (const item of items) {
      if (!item.due_date) continue
      const dateKey = item.due_date.slice(0, 10)
      if (!map.has(dateKey)) map.set(dateKey, [])
      map.get(dateKey)!.push(item)
    }
    return map
  }, [items])

  const selectedItems = selectedDate ? (itemsByDate.get(selectedDate) ?? []) : []

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const dayNames = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom']

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const goToday = () => setCurrentDate(new Date())

  const monthLabel = format(currentDate, 'MMMM yyyy', { locale: it })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="btn-ghost w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] capitalize tracking-tight">
            {monthLabel}
          </h2>
          <button
            onClick={nextMonth}
            className="btn-ghost w-9 h-9 rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <button
          onClick={goToday}
          className="btn-primary text-sm px-4 py-2 rounded-xl"
        >
          Oggi
        </button>
      </div>

      <div className="card p-4">
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((name) => (
            <div
              key={name}
              className="text-center text-xs font-medium text-[var(--text-tertiary)] py-2"
            >
              {name}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayItems = itemsByDate.get(dateKey)
            const inMonth = isSameMonth(day, monthStart)
            const today = isToday(day)
            const selected = selectedDate === dateKey

            return (
              <button
                key={idx}
                onClick={() => setSelectedDate(selected ? null : dateKey)}
                className={`
                  relative min-h-[80px] p-1.5 border border-[var(--border)] transition-all duration-150
                  ${inMonth ? 'bg-[var(--bg-card)]' : 'bg-[var(--bg-secondary)]'}
                  ${selected ? 'ring-2 ring-[var(--accent-primary)] ring-inset z-10' : ''}
                  hover:bg-[var(--bg-secondary)]/50
                `}
              >
                <div className="flex items-center justify-center mb-1">
                  <span
                    className={`
                      text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
                      ${today ? 'bg-[var(--accent-primary)] text-white' : ''}
                      ${!inMonth ? 'text-[var(--text-tertiary)]/50' : today ? '' : 'text-[var(--text-primary)]'}
                    `}
                  >
                    {format(day, 'd')}
                  </span>
                </div>
                {dayItems && dayItems.length > 0 && (
                  <div className="space-y-0.5">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-1 px-1 py-0.5 rounded-md truncate"
                        style={{ backgroundColor: `${categoryColors[item.category]}10` }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: categoryColors[item.category] }}
                        />
                        <span className="text-[10px] leading-tight text-[var(--text-secondary)] truncate">
                          {item.description}
                        </span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <p className="text-[10px] text-[var(--text-tertiary)] text-center">
                        +{dayItems.length - 3}
                      </p>
                    )}
                  </div>
                )}
                {dayItems && dayItems.length === 0 && inMonth && (
                  <div className="h-full" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {selectedDate && selectedItems.length > 0 && (
        <div className="card p-5 fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">
              {format(parseISO(selectedDate), 'EEEE d MMMM', { locale: it })}
            </h3>
            <span className="text-xs text-[var(--text-tertiary)] bg-[var(--bg-secondary)] px-2.5 py-1 rounded-lg">
              {selectedItems.length} {selectedItems.length === 1 ? 'attività' : 'attività'}
            </span>
          </div>
          <div className="space-y-2">
            {selectedItems.map((item) => (
              <TaskCard
                key={item.id}
                item={item}
                onToggle={onToggle}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {selectedDate && selectedItems.length === 0 && (
        <div className="card p-5 text-center fade-in">
          <p className="text-sm text-[var(--text-tertiary)]">
            Nessuna attività per questo giorno
          </p>
        </div>
      )}
    </div>
  )
}
