# Sbroglia.ai — Life Admin AI Assistant

**Sbroglia** (Italian: *untangle*) helps you organize your life by typing or speaking naturally. Describe what you need to do in plain Italian — the AI parses it into tasks, deadlines, reminders, and shopping items.

## Features

- **Natural language input** — type or speak in Italian: *"Compra latte e pane domani"*, *"Pagare affitto entro venerdì"*, *"Fare la spesa e prendere l'acqua"*
- **AI-powered parsing** — Groq (Llama 3.3 70B) extracts categories, dates, priorities, and quantities
- **Offline fallback parser** — works without API keys for common Italian phrases
- **Voice input** — Web Speech API with Italian language support
- **Dashboard** — three-column view: Today / Due Soon / Shopping List
- **Calendar** — month grid with task pills grouped by date, colored by category
- **Magic link auth** — passwordless login via Supabase email links

## Tech Stack

| Layer          | Technology                           |
| -------------- | ------------------------------------ |
| Framework      | Next.js 14 (App Router)              |
| Language       | TypeScript                           |
| Styling        | Tailwind CSS                         |
| Auth & DB      | Supabase (PostgreSQL + RLS + Auth)   |
| State          | Zustand                              |
| AI             | Groq (Llama 3.3 70B) + fallback NLP  |
| Voice          | Web Speech API (`SpeechRecognition`) |

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- (Optional) A Groq API key — get one free at [console.groq.com](https://console.groq.com/)

### Setup

```bash
git clone <repo-url>
cd sbroglia-io
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
GROQ_API_KEY=your_groq_api_key    # optional — without it, offline parser is used
```

Run the Supabase schema from `supabase/migrations/001_initial_schema.sql` in your Supabase SQL editor, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Database Schema

- `profiles` — user profiles, created on signup via trigger
- `items` — tasks, deadlines, shopping items, reminders with category, priority, due dates, completion status
- `parsing_logs` — logs of AI/fallback parsing for debugging

Row-level security (RLS) ensures users only see their own data.

## Usage

1. Go to the home page → enter your email → receive a magic link
2. Type or speak: *"devo comprare il latte, chiamare il dottore domani alle 10, e pagare l'affitto entro venerdì"*
3. Items appear in the correct columns: task goes to **Oggi**, deadline creates a countdown, shopping goes to **Lista Spesa**
4. Use the **Calendar** view to see everything on a month grid
5. Mark items as complete and they auto-purge after 30 days
