'use client'

import { useState, useRef, useEffect } from 'react'
import type { InputState, ParsedItem, DbItem } from '@/lib/types'
import { Badge } from './ui/Badge'

interface MagicInputProps {
  onItemsCreated: (items: DbItem[]) => void
}

export function MagicInput({ onItemsCreated }: MagicInputProps) {
  const [text, setText] = useState('')
  const [state, setState] = useState<InputState>('idle')
  const [parsedPreview, setParsedPreview] = useState<ParsedItem[]>([])
  const [errorMessage, setErrorMessage] = useState('')
  const [parsingNotes, setParsingNotes] = useState('')
  const [source, setSource] = useState<'ai' | 'fallback' | ''>('')
  const [isListening, setIsListening] = useState(false)
  const [voiceUnsupported, setVoiceUnsupported] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const processingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SR = window.SpeechRecognition || window.webkitSpeechRecognition
      if (!SR) setVoiceUnsupported(true)
    }
  }, [])

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    const recognition = new SR()
    recognition.lang = 'it-IT'
    recognition.continuous = false
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const final = Array.from(event.results)
        .filter((r) => r.isFinal)
        .map((r) => r[0].transcript)
        .join(' ')
      if (final) {
        setText((prev) => {
          const next = prev ? `${prev} ${final}` : final
          return next
        })
        setState('typing')
      }
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.onerror = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }, [text])

  useEffect(() => {
    if (state === 'success') {
      processingTimeoutRef.current = setTimeout(() => {
        setParsedPreview([])
        setParsingNotes('')
        setSource('')
        setState('idle')
      }, 4000)
      return () => clearTimeout(processingTimeoutRef.current)
    }
  }, [state])



  const handleSubmit = async () => {
    if (!text.trim() || state === 'processing') return

    setState('processing')
    setErrorMessage('')

    try {
      const res = await fetch('/api/parse-input', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Errore durante il parsing')
      }

      const data = await res.json()
      setParsedPreview(data.items.map((item: DbItem) => ({
        description: item.description,
        category: item.category,
        priority: item.priority,
        due_date: item.due_date,
        shopping_quantity: item.shopping_quantity,
        confidence: 1,
      })))
      setParsingNotes(data.parsing_notes || '')
      setSource(data.source || '')
      setState('success')
      setText('')
      onItemsCreated(data.items)
    } catch (error) {
      setState('error')
      setErrorMessage(error instanceof Error ? error.message : 'Errore sconosciuto')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value)
    if (state === 'idle' && e.target.value.length > 0) {
      setState('typing')
    } else if (state === 'typing' && e.target.value.length === 0) {
      setState('idle')
    }
    if (state === 'error') {
      setState(e.target.value.length > 0 ? 'typing' : 'idle')
      setErrorMessage('')
      setParsingNotes('')
      setSource('')
    }
  }

  return (
    <div className="w-full" role="region" aria-label="Inserisci task">
      <div className="relative">
        <div className={`relative rounded-2xl bg-[var(--bg-card)] border-2 transition-all duration-300 ${
          state === 'error'
            ? 'border-red-300 shadow-lg shadow-red-500/10'
            : state === 'processing'
            ? 'border-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/10'
            : text.trim().length > 0
            ? 'border-[var(--accent-primary)]/50 shadow-md'
            : 'border-[var(--border)] hover:border-[var(--text-tertiary)]'
        }`}>
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={text}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Scrivi tutto quello che hai in testa..."
              rows={2}
              disabled={state === 'processing'}
              aria-label="Descrivi cosa devi fare"
              className="w-full resize-none bg-transparent px-5 py-4 pr-12 text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] text-base leading-relaxed focus:outline-none disabled:opacity-50 transition-opacity"
            />
            {!voiceUnsupported && state !== 'processing' && (
              <button
                onClick={toggleListening}
                className={`absolute right-3 top-4 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  isListening
                    ? 'bg-[var(--accent-high)] text-white shadow-lg shadow-red-500/30'
                    : 'text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                }`}
                aria-label={isListening ? 'Ferma registrazione' : 'Registra voce'}
              >
                {isListening ? (
                  <span className="flex gap-0.5 items-end h-4">
                    <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '60%' }} />
                    <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '100%', animationDelay: '0.15s' }} />
                    <span className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: '40%', animationDelay: '0.3s' }} />
                  </span>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="9" y="2" width="6" height="11" rx="3" strokeWidth="1.5"/>
                    <path strokeLinecap="round" strokeWidth="1.5" d="M5 11a7 7 0 0014 0"/>
                    <rect x="11" y="18" width="2" height="3" rx="1" fill="currentColor" stroke="none"/>
                    <path strokeLinecap="round" strokeWidth="1.5" d="M8 21h8"/>
                  </svg>
                )}
              </button>
            )}
          </div>

          {state === 'typing' && text.trim().length > 0 && (
            <div className="flex items-center justify-between px-5 pb-4 animate-fade-in">
              <span className="text-xs text-[var(--text-tertiary)]">
                <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-[var(--bg-secondary)] text-[var(--text-tertiary)] text-xs border border-[var(--border)]">
                  {navigator.platform.includes('Mac') ? 'Cmd' : 'Ctrl'}+Enter
                </kbd>
                <span className="sm:hidden">Tocca invia</span>
              </span>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-xl gradient-bg text-white text-sm font-medium hover:opacity-90 active:scale-[0.97] transition-all duration-200 shadow-md shadow-[var(--accent-primary)]/20"
                aria-label="Invia testo"
              >
                Sbroglia!
              </button>
            </div>
          )}

          {state === 'processing' && (
            <div className="px-5 pb-4" role="status">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                  <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                  <span className="thinking-dot w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                </div>
                <p className="text-sm text-[var(--text-tertiary)] animate-pulse">
                                  Sto organizzando...
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {state === 'success' && (
        <div className="mt-4 animate-slide-up" role="status" aria-live="polite">
          {parsedPreview.length > 0 ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[var(--accent-low)]/5 to-emerald-50 border border-[var(--accent-low)]/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-[var(--accent-low)]/10 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-[var(--accent-low)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-[var(--accent-low)]">
                  Ho organizzato {parsedPreview.length} elemento{parsedPreview.length > 1 ? 'i' : ''}:
                </p>
                {source && (
                  <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${
                    source === 'ai' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    {source === 'ai' ? 'AI' : 'Parser'}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {parsedPreview.map((item, i) => (
                  <div
                    key={i}
                    className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[var(--border)] text-sm animate-slide-up shadow-sm"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <Badge variant="category" color={item.category} />
                    <span className="text-[var(--text-primary)]">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3.5 h-3.5 text-[var(--accent-medium)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-amber-800 mb-0.5">Nessun elemento riconosciuto</p>
                  <p className="text-sm text-amber-600">
                    {parsingNotes || 'Prova a essere più specifico o usa parole diverse.'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {state === 'error' && (
        <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-100 animate-slide-up" role="alert">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3.5 h-3.5 text-[var(--accent-high)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--accent-high)] mb-0.5">Qualcosa non ha funzionato</p>
              <p className="text-sm text-red-600">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
