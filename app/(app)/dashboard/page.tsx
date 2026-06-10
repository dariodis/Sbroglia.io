'use client'

import { useTasks } from '@/hooks/useTasks'
import { MagicInput } from '@/components/MagicInput'
import { DashboardColumns } from '@/components/DashboardColumns'
import { Spinner } from '@/components/ui/Spinner'

export default function DashboardPage() {
  const { items, isLoading, error, toggleTask, deleteTask, addItems } = useTasks()

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-[var(--text-tertiary)] animate-pulse">Caricando la tua dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-5 rounded-2xl bg-red-50 border border-red-100">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[var(--accent-high)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[var(--accent-high)] mb-0.5">Errore di caricamento</p>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1 tracking-tight">
          Cosa devi fare?
        </h1>
        <p className="text-sm text-[var(--text-tertiary)]">
          Scrivi tutto quello che hai in testa, in una volta sola
        </p>
      </div>
      <MagicInput onItemsCreated={addItems} />
      <DashboardColumns
        items={items}
        onToggle={toggleTask}
        onDelete={deleteTask}
      />
    </div>
  )
}
