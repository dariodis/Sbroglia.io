'use client'

import type { DbItem } from '@/lib/types'

interface ShoppingListProps {
  items: DbItem[]
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function ShoppingList({ items, onToggle, onDelete }: ShoppingListProps) {
  const handleCopyList = () => {
    const text = items
      .filter((i) => !i.is_completed)
      .map((i) => {
        const qty = i.shopping_quantity ? ` (${i.shopping_quantity})` : ''
        return `☐ ${i.description}${qty}`
      })
      .join('\n')
    navigator.clipboard.writeText(text)
  }

  if (items.length === 0) return null

  const completedCount = items.filter((i) => i.is_completed).length
  const totalCount = items.length

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-secondary)]/50">
        <span className="text-xs text-[var(--text-secondary)]">
          {completedCount}/{totalCount} acquistati
        </span>
        <button
          onClick={handleCopyList}
          className="inline-flex items-center gap-1.5 text-xs text-[var(--accent-primary)] hover:text-[var(--accent-primary-dark)] transition-colors font-medium"
          aria-label="Copia lista"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copia lista
        </button>
      </div>
      <div className="divide-y divide-[var(--border)]">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-3 px-4 py-3 transition-all duration-200 ${
              item.is_completed ? 'opacity-50 bg-[var(--bg-secondary)]/30' : 'hover:bg-[var(--bg-secondary)]/20'
            }`}
          >
            <button
              onClick={() => onToggle(item.id, !item.is_completed)}
              className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
                item.is_completed
                  ? 'bg-[var(--accent-low)] border-[var(--accent-low)] scale-in'
                  : 'border-[var(--border)] hover:border-[var(--accent-primary)] hover:bg-[var(--accent-primary)]/5'
              }`}
              aria-label={item.is_completed ? 'Togli dalla lista' : 'Aggiungi alla lista'}
            >
              {item.is_completed && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
            <span
              className={`flex-1 text-sm leading-relaxed ${
                item.is_completed
                  ? 'line-through text-[var(--text-tertiary)]'
                  : 'text-[var(--text-primary)]'
              }`}
            >
              {item.description}
              {item.shopping_quantity && (
                <span className="text-xs text-[var(--text-tertiary)] ml-1">
                  ({item.shopping_quantity})
                </span>
              )}
            </span>
            <button
              onClick={() => onDelete(item.id)}
              className="btn-ghost w-7 h-7 rounded-lg p-0 flex-shrink-0 hover:text-[var(--accent-high)]"
              aria-label="Rimuovi"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
