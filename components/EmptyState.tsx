'use client'

interface EmptyStateProps {
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
      <div className="w-12 h-12 rounded-2xl bg-[var(--bg-secondary)] flex items-center justify-center mb-3">
        <svg className="w-6 h-6 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-[var(--text-tertiary)]">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="mt-4 px-4 py-2 rounded-xl gradient-bg text-white text-xs font-medium hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-md shadow-[var(--accent-primary)]/20"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
