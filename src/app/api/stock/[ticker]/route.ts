import { NextResponse } from "next/server";
import { getStockPrice, getPriceHistory } from "@/lib/prices";

export async function GET(
  _req: Request,
  { params }: { params: { ticker: string } }
) {
  const { ticker } = params;
  const [price, history] = await Promise.all([
    getStockPrice(ticker),
    getPriceHistory(ticker, 60),
  ]);
  return NextResponse.json({ ticker, price, history });
}
