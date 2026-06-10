'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { DbItem } from '@/lib/types'

export function useRealtimeSync(onUpdate: (items: DbItem[]) => void) {
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('items-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'items' },
        () => {
          fetch('/api/tasks')
            .then((res) => res.json())
            .then((data) => onUpdate(data))
            .catch(console.error)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [onUpdate])
}
