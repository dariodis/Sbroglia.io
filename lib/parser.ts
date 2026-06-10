export function normalizeDate(dateStr: string | null): string | null {
  if (!dateStr) return null
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return null
    return date.toISOString()
  } catch {
    return null
  }
}

export function formatDateItalian(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })
}

export function formatCountdown(dateStr: string): string {
  const now = new Date()
  const target = new Date(dateStr)
  const diffMs = target.getTime() - now.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

  if (diffHours <= 0) return 'Scaduto'
  if (diffHours < 24) return `tra ${diffHours} ore`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `tra ${diffDays} giorni`
  return formatDateItalian(dateStr)
}

export function getUrgencyColor(dateStr: string): 'red' | 'orange' | 'green' {
  const now = new Date()
  const target = new Date(dateStr)
  const diffMs = target.getTime() - now.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)

  if (diffHours < 24) return 'red'
  if (diffHours < 72) return 'orange'
  return 'green'
}
