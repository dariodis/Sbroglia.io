'use client'

import { useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

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

  if (sent) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6">
        <div className="w-full max-w-sm text-center animate-slide-up">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-low)] to-emerald-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[var(--accent-low)]/20">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
            Controlla la tua email
          </h1>
          <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
            Ti abbiamo inviato un link magico a <strong className="text-[var(--text-primary)]">{email}</strong>.<br />
            Cliccalo per accedere senza password.
          </p>
          <button
            onClick={() => { setSent(false); setEmail('') }}
            className="mt-8 text-sm text-[var(--accent-primary)] hover:underline"
          >
            Usa un&apos;altra email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <Image
            src="/sbroglia-logo.svg"
            alt="Sbroglia.io"
            width={280}
            height={280}
            className="mx-auto mb-5"
          />
          <h1 className="text-2xl font-semibold text-[var(--text-primary)] mb-1">
            Accedi a Sbroglia.io
          </h1>
          <p className="text-sm text-[var(--text-secondary)]">
            Inserisci la tua email, nessuna password necessaria
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-[var(--text-primary)]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la tua@email.com"
              required
              autoFocus
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all duration-200"
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
            ) : 'Invia link magico'}
          </button>

          <p className="text-xs text-center text-[var(--text-tertiary)] pt-2">
            Riceverai un link via email. Nessuna password da ricordare.
          </p>
        </form>
      </div>
    </div>
  )
}
