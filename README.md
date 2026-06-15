# 🇺🇸 Trump Trade Tracker

Real-time dashboard tracking President Trump’s stock trades via OGE Form 278-T disclosures.

## Stack
- **Next.js 14** (App Router, ISR)
- **Quiver Quantitative API** — Trump trade data
- **Yahoo Finance** — stock prices (free, no key)
- **Supabase** — PostgreSQL persistence + subscribers
- **OpenWA / Twilio** — WhatsApp alerts
- **Vercel** — hosting + hourly cron

## Quick Start

```bash
git clone https://github.com/calvincrasto13/trump-trade-tracker
cd trump-trade-tracker
npm install
cp .env.local.example .env.local
# Fill in your keys (see below)
npm run dev
```

## Environment Variables
See `.env.local.example` for all required keys.

### 1. Quiver Quant API Key (required for live data)
- Sign up at https://api.quiverquant.com
- Use promo code **TWITTER** for free trial
- Endpoint: `GET /beta/live/trump-stock-trades`

### 2. Supabase (free tier)
- Create project at https://supabase.com
- Run `supabase/schema.sql` in the SQL Editor

### 3. WhatsApp Alerts
**Option A — OpenWA (free, self-hosted):**
```bash
git clone https://github.com/rmyndharis/OpenWA
cd OpenWA && docker-compose up -d
# Open http://localhost:3000, scan QR with WhatsApp
```
Set `OPENWA_URL=http://localhost:3000` in `.env.local`

**Option B — Twilio sandbox (free tier):**
- https://console.twilio.com
- Users send "join <keyword>" to +1 415 523 8886

## Deploy to Vercel
```bash
npm i -g vercel && vercel deploy
```
Vercel reads `vercel.json` and runs the hourly cron automatically.

## Data Sources
- OGE Form 278-T (May 14, 2026): https://extapps2.oge.gov
- Quiver Quant: https://www.quiverquant.com/Donald-Trump-Stock-Trades/
- Open Cabinet: https://open-cabinet.org/officials/trump-donald-j
