import OpenAI from 'openai'
import type { GeminiResponse, ParsedItem } from './types'
import { fallbackParse } from './fallback-parser'

function getAIClient() {
  if (!process.env.GROQ_API_KEY) return null
  return new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

const SYSTEM_PROMPT = `Sei un assistente di parsing per un'app di life admin italiana. Trasformi testo libero in JSON strutturato.

Regole:
- Se il testo contiene piu' azioni separate da "e", "poi", "," crea UN ITEM PER OGNI azione
- Categorie: "task" | "deadline" | "shopping" | "reminder"
- "fare la spesa" e' un TASK (l'azione di andare al supermercato), NON uno shopping item
- Shopping items sono COSE DA COMPRARE: latte, pane, acqua, ecc.
- Priorita': "high" | "medium" | "low"
- Date relative ("domani", "venerdì", "tra una settimana") → ISO 8601
- Per shopping: estrai quantità se presente (es. "500g", "un litro")
- confidence: float 0-1

Rispondi SOLO con JSON, schema:
{
  "items": [
    {
      "description": "stringa in italiano",
      "category": "task|deadline|shopping|reminder",
      "priority": "high|medium|low",
      "due_date": "ISO8601|null",
      "shopping_quantity": "string|null",
      "confidence": 0.95
    }
  ],
  "parsing_notes": "note opzionali"
}

Edge cases:
- Input non comprensibile: { "items": [] }
- Ambigui: category "task" fallback, confidence bassa

NON aggiungere testo fuori dal JSON. Solo JSON valido.`

function cleanJsonResponse(text: string): string {
  const trimmed = text.trim()
  const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (match) return match[1].trim()
  return trimmed
}

async function aiParse(text: string): Promise<GeminiResponse | null> {
  const client = getAIClient()
  if (!client) return null

  const currentDate = new Date().toISOString().split('T')[0]
  const userMessage = `Data corrente: ${currentDate}\n\nTesto utente: "${text.trim()}"`

  try {
    const completion = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.1,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) return null

    const cleaned = cleanJsonResponse(content)
    const parsed: GeminiResponse = JSON.parse(cleaned)
    if (!parsed.items || !Array.isArray(parsed.items)) return null
    return parsed
  } catch (error) {
    console.error('AI API error:', error)
    return null
  }
}

export async function parseInput(userText: string): Promise<{
  items: ParsedItem[]
  parsing_notes: string
  source: 'ai' | 'fallback'
}> {
  if (!userText || userText.trim().length === 0) {
    return { items: [], parsing_notes: 'Input non comprensibile', source: 'fallback' }
  }

  const aiResult = await aiParse(userText)

  if (aiResult && aiResult.items && aiResult.items.length > 0) {
    return {
      items: aiResult.items,
      parsing_notes: aiResult.parsing_notes || '',
      source: 'ai',
    }
  }

  const fallbackItems = fallbackParse(userText)
  return {
    items: fallbackItems,
    parsing_notes: fallbackItems.length > 0
      ? 'Parser offline: potrebbe essere meno preciso'
      : 'Nessun elemento riconosciuto dal parser offline',
    source: 'fallback',
  }
}
