'use client'

import { useState, useEffect, useCallback } from 'react'
import type { DbItem } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

export function useTasks() {
  const [items, setItems] = useState<DbItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks')
      if (!res.ok) throw new Error('Errore nel caricamento')
      const data = await res.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const toggleTask = useCallback(async (id: string, completed: boolean) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, is_completed: completed, completed_at: completed ? new Date().toISOString() : null }
          : item
      )
    )

    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_completed: completed }),
      })
      if (!res.ok) throw new Error('Errore aggiornamento')
    } catch {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, is_completed: !completed, completed_at: completed ? null : new Date().toISOString() }
            : item
        )
      )
    }
  }, [])

  const deleteTask = useCallback(async (id: string) => {
    const previous = items
    setItems((prev) => prev.filter((item) => item.id !== id))

    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Errore eliminazione')
    } catch {
      setItems(previous)
    }
  }, [items])

  const addItems = useCallback((newItems: DbItem[]) => {
    setItems((prev) => [...newItems, ...prev])
  }, [])

  return { items, isLoading, error, toggleTask, deleteTask, addItems, refetch: fetchTasks }
}
