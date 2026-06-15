import { NextRequest, NextResponse } from "next/server";
import { fetchTrumpTrades, parseDollarRange } from "@/lib/quiver";
import { supabaseAdmin } from "@/lib/supabase";
import { sendWhatsApp, formatTradeAlert } from "@/lib/whatsapp";

// Called hourly by Vercel Cron — vercel.json: { "path": "/api/cron/poll", "schedule": "0 * * * *" }
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const admin = supabaseAdmin();

  try {
    // 1. Fetch latest trades from Quiver
    const raw = await fetchTrumpTrades();

    // 2. Get all known trade IDs from Supabase
    const { data: known } = await admin
      .from("trades")
      .select("ticker, trade_date, type");
    const knownSet = new Set(
      (known ?? []).map((r) => `${r.ticker}|${r.trade_date}|${r.type}`)
    );

    // 3. Find genuinely new trades
    const newTrades = raw.filter((t) => {
      const type = t.Transaction.startsWith("Purchase") ? "Buy" : "Sell";
      return !knownSet.has(`${t.Ticker}|${t.Date}|${type}`);
    });

    if (newTrades.length === 0) {
      return NextResponse.json({ ok: true, newTrades: 0 });
    }

    // 4. Upsert new trades to Supabase
    const rows = newTrades.map((t) => {
      const { min, max } = parseDollarRange(t.Range);
      return {
        ticker: t.Ticker,
        company: t.Ticker,
        type: t.Transaction.startsWith("Purchase") ? "Buy" : "Sell",
        range: t.Range,
        min_amount: min,
        max_amount: max,
        trade_date: t.Date,
        filed_date: t.ReportDate,
        late: new Date(t.ReportDate).getTime() - new Date(t.Date).getTime() > 30 * 86400000,
        fetched_at: new Date().toISOString(),
      };
    });
    await admin.from("trades").upsert(rows, { onConflict: "ticker,trade_date,type" });

    // 5. Get all subscribers
    const { data: subs } = await admin.from("subscribers").select("phone");
    const phones = (subs ?? []).map((s) => s.phone);

    // 6. Send WhatsApp alert for each new trade to each subscriber
    let sent = 0;
    for (const trade of newTrades.slice(0, 5)) {
      const type = trade.Transaction.startsWith("Purchase") ? "Buy" : "Sell";
      const msg = formatTradeAlert({
        ticker: trade.Ticker,
        company: trade.Ticker,
        type,
        range: trade.Range,
        date: trade.Date,
      });
      for (const phone of phones) {
        try { await sendWhatsApp({ to: phone, body: msg }); sent++; } catch {}
      }
    }

    return NextResponse.json({ ok: true, newTrades: newTrades.length, alertsSent: sent });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
