// Yahoo Finance (free, no API key) via public chart endpoint
export async function getStockPrice(ticker: string): Promise<number | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=1d`,
      { next: { revalidate: 300 } }
    );
    const json = await res.json();
    return json?.chart?.result?.[0]?.meta?.regularMarketPrice ?? null;
  } catch {
    return null;
  }
}

export async function getPriceHistory(
  ticker: string,
  days = 60
): Promise<{ date: string; price: number }[]> {
  try {
    const range = days <= 30 ? "1mo" : days <= 90 ? "3mo" : "6mo";
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=${range}`,
      { next: { revalidate: 3600 } }
    );
    const json = await res.json();
    const result = json?.chart?.result?.[0];
    if (!result) return [];
    const ts: number[] = result.timestamp;
    const closes: number[] = result.indicators.quote[0].close;
    return ts.map((t, i) => ({
      date: new Date(t * 1000).toISOString().split("T")[0],
      price: +closes[i].toFixed(2),
    }));
  } catch {
    return [];
  }
}
