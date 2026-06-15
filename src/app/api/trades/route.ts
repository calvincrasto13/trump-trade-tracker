import { NextResponse } from "next/server";
import { fetchTrumpTrades, parseDollarRange } from "@/lib/quiver";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Try Supabase cache first (fresh = < 2 hours old)
    const admin = supabaseAdmin();
    const { data: cached } = await admin
      .from("trades")
      .select("*")
      .order("trade_date", { ascending: false })
      .limit(200);

    if (cached && cached.length > 0) {
      const age = Date.now() - new Date(cached[0].fetched_at ?? 0).getTime();
      if (age < 2 * 60 * 60 * 1000) {
        return NextResponse.json({ source: "cache", trades: cached });
      }
    }

    // 2. Fetch live from Quiver
    const raw = await fetchTrumpTrades();
    const trades = raw.map((t) => {
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

    // 3. Upsert to Supabase
    await admin.from("trades").upsert(trades, {
      onConflict: "ticker,trade_date,type",
      ignoreDuplicates: false,
    });

    return NextResponse.json({ source: "live", trades });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/trades]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
