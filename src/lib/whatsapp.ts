// WhatsApp delivery — tries OpenWA first, falls back to Twilio sandbox
export interface WAMessage { to: string; body: string }

export async function sendWhatsApp({ to, body }: WAMessage): Promise<void> {
  if (process.env.OPENWA_URL) {
    await sendViaOpenWA({ to, body });
  } else if (process.env.TWILIO_ACCOUNT_SID) {
    await sendViaTwilio({ to, body });
  } else {
    console.warn("[whatsapp] No provider configured — set OPENWA_URL or TWILIO_* env vars");
  }
}

async function sendViaOpenWA({ to, body }: WAMessage) {
  // OpenWA: github.com/rmyndharis/OpenWA
  // POST /send-message  { to: "628xxx@c.us", content: "..." }
  const phone = to.replace(/\D/g, "");
  const res = await fetch(`${process.env.OPENWA_URL}/send-message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(process.env.OPENWA_TOKEN ? { Authorization: `Bearer ${process.env.OPENWA_TOKEN}` } : {}),
    },
    body: JSON.stringify({ to: `${phone}@c.us`, content: body }),
  });
  if (!res.ok) throw new Error(`OpenWA error: ${res.status}`);
}

async function sendViaTwilio({ to, body }: WAMessage) {
  const { Twilio } = await import("twilio");
  const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_FROM!,
    to: `whatsapp:${to}`,
    body,
  });
}

export function formatTradeAlert(trade: {
  ticker: string; company: string; type: string;
  range: string; date: string; pctChange?: number;
}): string {
  const emoji = trade.type === "Buy" ? "🟢" : "🔴";
  const chg = trade.pctChange != null
    ? `\nStock since trade: ${trade.pctChange > 0 ? "+" : ""}${trade.pctChange.toFixed(1)}%`
    : "";
  return [
    `🇺🇸 *TRUMP TRADE ALERT*`,
    ``,
    `${emoji} *${trade.type.toUpperCase()}* — $${trade.ticker}`,
    `Company: ${trade.company}`,
    `Disclosed amount: ${trade.range}`,
    `Trade date: ${trade.date}${chg}`,
    ``,
    `Source: OGE Form 278-T via Quiver Quant`,
    `Track all trades → https://yourapp.vercel.app`,
  ].join("\n");
}
