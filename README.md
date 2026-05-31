# Dayforge

A responsive productivity beta for solo professionals. Users complete a short daily check-in across work, gym, diet, energy, mood, sleep, and reflection, then get a balanced productivity score, streaks, XP, trends, and rule-based insights.

## Stack

- Next.js + TypeScript
- Supabase Auth and Postgres
- Resend-compatible email reminder endpoint
- Vitest for scoring and gamification tests

## Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and fill in Supabase values.
3. Run `supabase/schema.sql` in your Supabase SQL editor.
4. Start the app with `npm run dev`.

Email reminders are sent by `POST /api/reminders` with the `x-cron-secret` header matching `REMINDER_CRON_SECRET`. If `RESEND_API_KEY` is missing, the endpoint records no send and logs that email is skipped.
