import { create } from 'zustand'
import type { DbItem } from '@/lib/types'

interface TaskStore {
  items: DbItem[]
  setItems: (items: DbItem[]) => void
  addItems: (items: DbItem[]) => void
  updateItem: (id: string, updates: Partial<DbItem>) => void
  removeItem: (id: string) => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItems: (newItems) =>
    set((state) => ({ items: [...newItems, ...state.items] })),
  updateItem: (id, updates) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    })),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}))
