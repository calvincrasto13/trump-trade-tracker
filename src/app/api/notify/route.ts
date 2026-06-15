import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { phone } = await req.json();
  if (!phone) return NextResponse.json({ error: "phone required" }, { status: 400 });

  const admin = supabaseAdmin();
  const { error } = await admin
    .from("subscribers")
    .upsert({ phone, subscribed_at: new Date().toISOString() }, { onConflict: "phone" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
