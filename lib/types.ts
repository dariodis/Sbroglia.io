export type ItemCategory = 'task' | 'deadline' | 'shopping' | 'reminder'
export type ItemPriority = 'high' | 'medium' | 'low'
export type InputState = 'idle' | 'typing' | 'processing' | 'success' | 'error'

export interface ParsedItem {
  description: string
  category: ItemCategory
  priority: ItemPriority
  due_date: string | null
  shopping_quantity: string | null
  confidence: number
}

export interface GeminiResponse {
  items: ParsedItem[]
  parsing_notes?: string
}

export interface DbItem {
  id: string
  user_id: string
  raw_input: string
  description: string
  category: ItemCategory
  priority: ItemPriority
  due_date: string | null
  is_completed: boolean
  completed_at: string | null
  shopping_quantity: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface ParsingLog {
  id: string
  user_id: string
  raw_input: string
  ai_response: GeminiResponse
  model_used: string
  tokens_used: number
  created_at: string
}

export interface Profile {
  id: string
  email: string
  display_name: string | null
  created_at: string
  timezone: string
}

export interface ApiError {
  error: string
  code?: string
}
