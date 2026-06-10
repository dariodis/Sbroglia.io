import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient, getSession } from '@/lib/supabase/server'
import { parseInput } from '@/lib/ai'

const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW = 60_000

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = rateLimit.get(userId)

  if (!entry || now > entry.resetAt) {
    rateLimit.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session?.user) {
      return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
    }

    if (!checkRateLimit(session.user.id)) {
      return NextResponse.json(
        { error: 'Troppe richieste. Riprova tra un minuto.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { text } = body as { text: string }

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Testo richiesto' }, { status: 400 })
    }

    const parsed = await parseInput(text)

    const supabase = await createServerSupabaseClient()

    await supabase.from('parsing_logs').insert({
      user_id: session.user.id,
      raw_input: text,
      ai_response: { items: parsed.items, parsing_notes: parsed.parsing_notes },
      model_used: parsed.source === 'ai' ? 'llama-3.3-70b-versatile' : 'fallback-parser',
      tokens_used: 0,
    })

    const createdItems = []
    for (const item of parsed.items) {
      const { data, error } = await supabase
        .from('items')
        .insert({
          user_id: session.user.id,
          raw_input: text,
          description: item.description,
          category: item.category,
          priority: item.priority,
          due_date: item.due_date,
          shopping_quantity: item.shopping_quantity,
        })
        .select()
        .single()

      if (error) {
        console.error('Errore creazione item:', error)
        continue
      }
      createdItems.push(data)
    }

    return NextResponse.json({
      items: createdItems,
      parsing_notes: parsed.parsing_notes,
      source: parsed.source,
    })
  } catch (error) {
    console.error('Parse input error:', error)
    return NextResponse.json(
      { error: 'Errore interno del server' },
      { status: 500 }
    )
  }
}
