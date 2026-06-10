import { GoogleGenerativeAI } from '@google/generative-ai'
import type { GeminiResponse } from './types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function buildPrompt(userText: string): string {
  const currentDate = new Date().toISOString().split('T')[0]

  return `Sei un assistente di parsing per un'app di life admin italiana. Ricevi testo libero in italiano (o misto italiano/inglese) e lo trasformi in dati strutturati JSON.

Data corrente: ${currentDate}

Dal testo dell'utente, estrai uno o più item. Per ogni item estrai:
- description: descrizione pulita e concisa dell'item (in italiano)
- category: uno tra "task" | "deadline" | "shopping" | "reminder"
- priority: uno tra "high" | "medium" | "low" — basato sul tono (es. "urgente", "entro oggi" = high)
- due_date: data in formato ISO 8601 se presente, altrimenti null. Usa come riferimento la data attuale fornita nel contesto.
- shopping_quantity: quantità se è un item della lista spesa (es. "500g", "una bottiglia"), altrimenti null
- confidence: float 0-1 quanto sei sicuro del parsing

Gestione date relative: "venerdì", "martedì prossimo", "domani", "tra una settimana", "fine mese" devono essere convertiti in date ISO precise.

Rispondi SOLO con JSON valido, nessun testo aggiuntivo. Schema richiesto:
{
  "items": [
    {
      "description": "string",
      "category": "task|deadline|shopping|reminder",
      "priority": "high|medium|low",
      "due_date": "ISO8601|null",
      "shopping_quantity": "string|null",
      "confidence": 0.95
    }
  ],
  "parsing_notes": "stringa opzionale con note sul parsing"
}

Edge cases:
- Input vuoto o non comprensibile → { "items": [], "parsing_notes": "Input non comprensibile" }
- Item ambigui → usa category: "task" come fallback e confidence bassa
- Numeri di telefono, email nel testo → includili nella description

Testo utente: "${userText.trim()}"`
}

export async function parseInput(userText: string): Promise<GeminiResponse> {
  if (!userText || userText.trim().length === 0) {
    return { items: [], parsing_notes: 'Input non comprensibile' }
  }

  try {
    const model = genAI.getGenerativeModel(
      { model: 'gemini-2.0-flash' },
      { apiVersion: 'v1beta' }
    )

    const prompt = buildPrompt(userText)
    const result = await model.generateContent(prompt)
    const response = result.response
    const text = response.text()

    if (!text || text.trim().length === 0) {
      return { items: [], parsing_notes: 'Risposta vuota dal modello AI' }
    }

    const cleaned = text.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim()
    const parsed: GeminiResponse = JSON.parse(cleaned)

    if (!parsed.items || !Array.isArray(parsed.items)) {
      return { items: [], parsing_notes: 'Formato risposta inatteso' }
    }

    return parsed
  } catch (error) {
    console.error('Gemini API error:', error)
    const message = error instanceof Error ? error.message : 'Errore sconosciuto'
    return {
      items: [],
      parsing_notes: `Errore AI: ${message}`,
    }
  }
}
