// Quiver Quantitative — Trump stock trade API
// Free trial: https://api.quiverquant.com  (promo code: TWITTER)
const BASE = "https://api.quiverquant.com/beta";

export interface QuiverTrade {
  Ticker: string;
  Transaction: "Purchase" | "Sale (Full)" | "Sale (Partial)";
  Range: string;       // e.g. "$1,001 - $15,000"
  Date: string;        // ISO date
  ReportDate: string;  // ISO date
  Name: string;        // "Donald J. Trump"
  Senator?: string;
}

export async function fetchTrumpTrades(): Promise<QuiverTrade[]> {
  const res = await fetch(`${BASE}/live/trump-stock-trades`, {
    headers: { Authorization: `Token ${process.env.QUIVER_API_KEY}` },
    next: { revalidate: 3600 },   // ISR: re-fetch every hour
  });

  if (!res.ok) {
    console.error("[quiver] fetch failed", res.status, await res.text());
    throw new Error(`Quiver API error: ${res.status}`);
  }

  const data: QuiverTrade[] = await res.json();
  return data;
}

export function parseDollarRange(range: string): { min: number; max: number } {
  const nums = range.replace(/[$,]/g, "").match(/\d+/g) ?? ["0", "0"];
  return { min: Number(nums[0]), max: Number(nums[1] ?? nums[0]) };
}
