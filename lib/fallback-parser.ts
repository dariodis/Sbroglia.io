import type { ParsedItem, ItemCategory, ItemPriority } from './types'

interface ParsedDate {
  date: string
  time?: string
}

const weekdayMap: Record<string, number> = {
  domenica: 0, lunedì: 1, lunedi: 1, martedì: 2, martedi: 2,
  mercoledì: 3, mercoledi: 3, giovedì: 4, giovedi: 4,
  venerdì: 5, venerdi: 5, sabato: 6,
}

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function parseRelativeDate(token: string): ParsedDate | null {
  const today = new Date()
  const lower = token.toLowerCase().trim()

  if (lower === 'oggi') return { date: toLocalDateStr(today) }
  if (lower === 'domani') {
    const d = new Date(today); d.setDate(d.getDate() + 1)
    return { date: toLocalDateStr(d) }
  }
  if (lower === 'dopodomani') {
    const d = new Date(today); d.setDate(d.getDate() + 2)
    return { date: toLocalDateStr(d) }
  }
  if (lower === 'stasera' || lower === 'stanotte') {
    return { date: toLocalDateStr(today), time: '20:00' }
  }

  for (const [name, dayIndex] of Object.entries(weekdayMap)) {
    if (lower === name) {
      const d = new Date(today)
      const currentDay = d.getDay()
      let diff = dayIndex - currentDay
      if (diff <= 0) diff += 7
      d.setDate(d.getDate() + diff)
      return { date: toLocalDateStr(d) }
    }
  }

  const nextMatch = lower.match(/prossim[oa]?\s+(.+)/)
  if (nextMatch) {
    const dayName = nextMatch[1].toLowerCase()
    const dayIndex = weekdayMap[dayName]
    if (dayIndex !== undefined) {
      const d = new Date(today)
      const currentDay = d.getDay()
      let diff = dayIndex - currentDay
      if (diff <= 0) diff += 7
      d.setDate(d.getDate() + diff + 7)
      return { date: toLocalDateStr(d) }
    }
  }

  const inMatch = lower.match(/tra\s+(\d+)\s*(giorn[oi]|settiman[ae]|mes[ei])/)
  if (inMatch) {
    const num = parseInt(inMatch[1])
    const unit = inMatch[2].toLowerCase()
    const d = new Date(today)
    if (unit.startsWith('giorn')) d.setDate(d.getDate() + num)
    else if (unit.startsWith('settim')) d.setDate(d.getDate() + num * 7)
    else if (unit.startsWith('mes')) d.setMonth(d.getMonth() + num)
    return { date: toLocalDateStr(d) }
  }

  if (lower === 'fine mese' || lower === 'a fine mese') {
    const d = new Date(today)
    d.setMonth(d.getMonth() + 1)
    d.setDate(0)
    return { date: toLocalDateStr(d) }
  }

  return null
}

function parseTime(text: string): string | null {
  const timeMatch = text.match(/alle\s*(\d{1,2})[.:](\d{2})\s*(?:del|di)?\s*/)
  if (timeMatch) {
    const h = timeMatch[1].padStart(2, '0')
    const m = timeMatch[2].padStart(2, '0')
    return `${h}:${m}`
  }
  const hourMatch = text.match(/alle\s*(\d{1,2})\s*(?:e\s*(mezza|30))?/)
  if (hourMatch) {
    const h = hourMatch[1].padStart(2, '0')
    const m = hourMatch[2] === 'mezza' || hourMatch[2] === '30' ? '30' : '00'
    return `${h}:${m}`
  }
  return null
}

const shoppingKeywords = /compra(re|i|)|prendere|acquista(re|i)|compare(re|i)\b/i
const deadlineKeywords = /paga(re|i|)|bolletta|scadenza|affitto|tassa|multa|debito|entro\b/i
const reminderKeywords = /ricorda(mi)?|promemoria|ricordo\b/i
const taskKeywords = /chiama(re|i)|telefona(re|i)|contatta(re|i)|manda(re|i)|invia(re|i)|andare\s+a|partecipare|fissa(re|i)|prenota(re|i)|porta(re|i)|fare\s+la\s+spesa\b/i

function detectCategory(text: string): ItemCategory {
  if (shoppingKeywords.test(text)) return 'shopping'
  if (deadlineKeywords.test(text)) return 'deadline'
  if (reminderKeywords.test(text)) return 'reminder'
  if (taskKeywords.test(text)) return 'task'
  return 'task'
}

const highPriorityKeywords = /urgen(te|za)|immediat[oa]|entro oggi|importante|cerca|subito|priorità\b/i
const lowPriorityKeywords = /tranquill[oa]|senza fretta|quando puoi|non urgente|moll[ae]\b/i

function detectPriority(text: string): ItemPriority {
  if (highPriorityKeywords.test(text)) return 'high'
  if (lowPriorityKeywords.test(text)) return 'low'
  return 'medium'
}

function detectDateAndTime(text: string): { date: string | null; time: string | null } {
  const time = parseTime(text)

  const dateMatch = text.match(/(?:tra\s+\d+\s*(?:giorn[oi]|settiman[ae]|mes[ei]|ore?)|fine\s+mese|oggi|domani|dopodomani|stasera|stanotte|prossim[oa]?\s+\w+|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|lunedi|martedi|mercoledi|giovedi|venerdi)/i)
  if (dateMatch) {
    const parsed = parseRelativeDate(dateMatch[0])
    if (parsed) {
      return {
        date: parsed.date,
        time: time || parsed.time || null,
      }
    }
  }

  return { date: null, time }
}

function detectQuantity(text: string): string | null {
  const qtyMatch = text.match(/(\d+\s*(?:kg|g|litri?|l|pezzi?|bottiglie?|confezioni?|pacchi?|etto|chili?|ml))/i)
  if (qtyMatch) return qtyMatch[1]
  const unitMatch = text.match(/(un[oa]?\s*(?:kg|litro|bottiglia|confezione|pacco|etto|pezzo|chilo))/i)
  if (unitMatch) return unitMatch[1]
  return null
}

function cleanDescription(text: string): string {
  return text
    .replace(/\b(oggi|domani|dopodomani|stasera|stanotte|prossim[oa]?\s+\w+|lunedì|martedì|mercoledì|giovedì|venerdì|sabato|domenica|lunedi|martedi|mercoledi|giovedi|venerdi|fine mese|tra\s+\d+\s*(?:giorn[oi]|settiman[ae]|mes[ei]))/gi, '')
    .replace(/\b(urgen(te|za)|immediat[oa]|tranquill[oa]|senza fretta|quando puoi|non urgente)\b/gi, '')
    .replace(/alle\s*\d{1,2}[.:]\d{2}(?:\s*(?:del|di))?/gi, '')
    .replace(/alle\s*\d{1,2}(?:\s*e\s*(?:mezza|30))?/gi, '')
    .replace(/\b(io )?devo\b/gi, '')
    .replace(/\bpoi\b/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*e\s+/i, '')
    .trim()
    .replace(/^[ae]\s+/i, '')
    .trim()
}

function isShoppingPhrase(text: string): boolean {
  return /compra(re|i|)|prendere|acquista(re|i|)/i.test(text)
}

function extractShoppingQuantityAndDescription(raw: string): { description: string; quantity: string | null } {
  const quantity = detectQuantity(raw)
  const desc = cleanDescription(raw)
  if (quantity && desc.includes(quantity)) {
    return {
      description: desc.replace(quantity, '').trim().replace(/\s+/g, ' '),
      quantity,
    }
  }
  return { description: desc, quantity: null }
}

function splitInput(text: string): string[] {
  let segments: string[] = []

  const cleaned = text
    .replace(/[“"]/g, '"')
    .replace(/[”"]/g, '"')

  const sentences = cleaned.split(/(?<=[.!?])\s+/)
  for (const sentence of sentences) {
    const parts = sentence.split(/\b(?:,?\s*e\s+poi|\.\s*poi|,\s*poi|,\s*e\s+|\.\s*[Ee]\s+|;\s*)\b/)
    for (const part of parts) {
      const subParts = part.split(/(?:\s*,\s*|\s+e\s+)(?=(?:devo|dobbiamo|bisogna|occorre|compra|prendi|chiama|paga|ricorda|andare|fare|porta|manda|invia|telefona|contatta|prenota|fissa))/i)
      for (const sub of subParts) {
        const trimmed = sub.trim()
        if (trimmed) segments.push(trimmed)
      }
    }
  }

  if (segments.length === 0) {
    segments = [cleaned.trim()]
  }

  return segments
}

export function fallbackParse(text: string): ParsedItem[] {
  if (!text || text.trim().length === 0) return []

  const segments = splitInput(text)
  const items: ParsedItem[] = []

  for (const segment of segments) {
    const category = detectCategory(segment)
    const priority = detectPriority(segment)
    const { date, time } = detectDateAndTime(segment)

    let dueDate: string | null = null
    if (date) {
      dueDate = time ? `${date}T${time}:00.000Z` : `${date}T23:59:59.000Z`
    }

    let description: string
    let shoppingQuantity: string | null = null

    if (category === 'shopping' || isShoppingPhrase(segment)) {
      const parsed = extractShoppingQuantityAndDescription(segment)
      description = parsed.description
      shoppingQuantity = parsed.quantity
    } else {
      description = cleanDescription(segment)
    }

    if (!description && segment.trim()) {
      description = segment.trim()
    }

    if (!description) continue

    description = description.charAt(0).toUpperCase() + description.slice(1)

    items.push({
      description,
      category,
      priority,
      due_date: dueDate,
      shopping_quantity: shoppingQuantity,
      confidence: 0.7,
    })
  }

  return items
}
