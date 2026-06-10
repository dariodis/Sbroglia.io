'use client'

import { useState } from 'react'
import type { DbItem } from '@/lib/types'
import { Badge } from './ui/Badge'

interface TaskCardProps {
  item: DbItem
  onToggle: (id: string, completed: boolean) => void
  onDelete: (id: string) => void
}

export function TaskCard({ item, onToggle, onDelete }: TaskCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editText, setEditText] = useState(item.description)

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditText(item.description)
  }

  const handleSaveEdit = async () => {
    if (editText.trim() && editText !== item.description) {
      await fetch(`/api/tasks/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: editText.trim() }),
      })
    }
    setIsEditing(false)
  }

  return (
    <div
      className={`card p-4 transition-all duration-200 ${
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
          {isEditing ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit()}
              className="w-full px-3 py-1.5 rounded-lg border-2 border-[var(--accent-primary)] text-sm text-[var(--text-primary)] focus:outline-none bg-white"
              autoFocus
            />
          ) : (
            <p
              className={`text-sm cursor-pointer leading-relaxed ${
                item.is_completed ? 'line-through text-[var(--text-tertiary)]' : 'text-[var(--text-primary)]'
              }`}
              onDoubleClick={handleDoubleClick}
            >
              {item.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-1.5 mt-2.5">
            <Badge variant="category" color={item.category} />
          </div>

        </div>

          <button
            onClick={() => onDelete(item.id)}
            className="btn-ghost w-7 h-7 rounded-lg p-0 hover:text-[var(--accent-high)]"
            aria-label="Elimina task"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
      </div>
    </div>
  )
}
