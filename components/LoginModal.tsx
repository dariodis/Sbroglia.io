'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface LoginModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setEmail('')
      setSent(false)
      setError('')
      setIsLoading(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    })

    setIsLoading(false)

    if (authError) {
      setError(authError.message)
      return
    }

    setSent(true)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl p-8 scale-in">
        {sent ? (
          <div className="text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--accent-low)] to-emerald-400 flex items-center justify-center mx-auto mb-5 shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
              Controlla la tua email
            </h2>
            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
              Abbiamo inviato un link di accesso a <strong className="text-[var(--text-primary)]">{email}</strong>.<br />
              Cliccalo per accedere al tuo account.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-[var(--accent-primary)] hover:underline"
              >
                Usa un&apos;altra email
              </button>
              <button
                onClick={onClose}
                className="text-sm text-[var(--text-tertiary)] hover:underline"
              >
                Chiudi
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                Accedi a Sbroglia.ai
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mt-1">
                Nessuna password necessaria
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="modal-email" className="text-sm font-medium text-[var(--text-primary)]">
                  Email
                </label>
                <input
                  id="modal-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="la tua@email.com"
                  required
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-[var(--accent-high)] fade-in">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full py-3 rounded-xl gradient-bg text-white font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-[0.98] shadow-lg shadow-[var(--accent-primary)]/20"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Invio in corso...
                  </span>
                ) : 'Invia email di accesso'}
              </button>

              <p className="text-xs text-center text-[var(--text-tertiary)]">
                Riceverai un link di accesso via email. Nessuna password da ricordare.
              </p>
            </form>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
