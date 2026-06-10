'use client'

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import LoginModal from "@/components/LoginModal";

export default function Home() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.replace("/dashboard");
      } else {
        setChecking(false);
      }
    };
    check();
  }, [router]);

  if (checking) return null;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <section className="relative flex-1 flex flex-col items-center justify-center px-6 pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 -left-40 w-[500px] h-[500px] rounded-full bg-[var(--accent-primary)]/5 blur-3xl" />
          <div className="absolute bottom-0 -right-40 w-[500px] h-[500px] rounded-full bg-[var(--accent-primary-light)]/5 blur-3xl" />
        </div>

        <div className="text-center max-w-2xl relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-medium mb-10 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)] animate-pulse" />
            Life Admin AI Assistant
          </div>

          <Image
            src="/sbroglia-logo.svg"
            alt="Sbroglia.io"
            width={160}
            height={160}
            priority
            className="mx-auto mb-6 animate-fade-in"
          />
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-[var(--text-primary)] mb-4 animate-slide-up">
            Togliti tutto il <span className="gradient-text">carico mentale</span>
          </h1>
          <p className="text-lg text-[var(--text-secondary)] mb-3 leading-relaxed max-w-md mx-auto animate-slide-up">
            Scrivi cosa devi fare in parole tue. L&apos;AI organizza tutto: task, scadenze, lista della spesa. Zero form, zero fatica.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in">
            <button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-dark)] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[var(--accent-primary)]/20"
            >
              Inizia gratis
              <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
            <button
              onClick={() => setIsOpen(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-[var(--border)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-secondary)] transition-all duration-200"
            >
              Ho già un account
            </button>
          </div>
        </div>
      </section>

      {/* Come funziona */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-3">
              Come funziona
            </h2>
            <p className="text-[var(--text-tertiary)] max-w-md mx-auto">
              Tre passaggi per organizzare la tua giornata
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Scrivi o parla",
                desc: "Descrivi cosa devi fare in italiano. Usa la voce o scrivi: naturale, senza form.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "AI organizza",
                desc: "Il nostro parser capisce date, priorità e categorie. Tutto viene strutturato automaticamente.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Gestisci tutto",
                desc: "Task, scadenze e lista spesa in dashboard e calendario. Completa e organizza con un click.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                ),
              },
            ].map(({ step, title, desc, icon }) => (
              <div key={step} className="card card-hover p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] mx-auto mb-5">
                  {icon}
                </div>
                <div className="text-xs font-semibold text-[var(--accent-primary)] mb-2 tracking-widest">{step}</div>
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Esempi */}
      <section className="py-20 px-6 bg-[var(--bg-secondary)]/50 border-t border-[var(--border)]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-3">
              Esempi
            </h2>
            <p className="text-[var(--text-tertiary)] max-w-md mx-auto">
              Scrivi come parlerebbe una persona normale
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { text: "Compra latte e pane domani", result: "Spesa · Scadenza: domani" },
              { text: "Pagare affitto entro venerdì", result: "Scadenza · Alta priorità" },
              { text: "Chiamare il dottore lunedì alle 10", result: "Task · Lun 10:00" },
              { text: "Fare la spesa e prendere l'acqua", result: "2 item: Task + Spesa" },
              { text: "Riunione di lavoro tra 3 giorni", result: "Task · Tra 3 giorni" },
              { text: "Comprare 500g di pasta", result: "Spesa · 500g" },
            ].map(({ text, result }) => (
              <div key={text} className="card p-5 flex items-start gap-4">
                <div className="w-8 h-8 rounded-xl bg-[var(--accent-primary)]/10 flex items-center justify-center text-[var(--accent-primary)] flex-shrink-0">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[var(--text-primary)] mb-1">&ldquo;{text}&rdquo;</p>
                  <p className="text-xs text-[var(--text-tertiary)]">{result}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-3">
              Tutto quello che ti serve
            </h2>
            <p className="text-[var(--text-tertiary)] max-w-md mx-auto">
              Nessun account pompato, nessuna funzione inutile
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: "🎤", title: "Input vocale", desc: "Parla invece di scrivere" },
              { icon: "🤖", title: "AI", desc: "Parsing intelligente in tempo reale" },
              { icon: "📅", title: "Calendario", desc: "Vista mensile delle attività" },
              { icon: "🛒", title: "Lista spesa", desc: "Con quantità e copia rapida" },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="card card-hover p-5 text-center">
                <div className="text-2xl mb-3">{icon}</div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{title}</h3>
                <p className="text-xs text-[var(--text-tertiary)]">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA finale */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-[var(--accent-primary)]/5 border-t border-[var(--border)]">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-semibold text-[var(--text-primary)] mb-4">
            Pronto a liberare la mente?
          </h2>
          <p className="text-[var(--text-secondary)] mb-8">
            Gratis. Senza registrazione pompata. Inizia in 10 secondi.
          </p>
          <button
            onClick={() => setIsOpen(true)}
            className="inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-[var(--accent-primary)] text-white font-medium hover:bg-[var(--accent-primary-dark)] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-[var(--accent-primary)]/20"
          >
            Inizia gratis
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-[var(--border)]">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Image src="/sbroglia-logo.svg" alt="" width={24} height={24} />
            <span className="text-sm text-[var(--text-tertiary)]">Sbroglia.io</span>
          </div>
          <p className="text-xs text-[var(--text-tertiary)]">
            Life Admin AI Assistant
          </p>
        </div>
      </footer>
      <LoginModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  );
}
