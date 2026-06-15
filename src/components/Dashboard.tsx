"use client";
import { useEffect, useState } from "react";

interface Trade {
  ticker: string; company: string; type: string;
  range: string; trade_date: string; filed_date: string;
  late: boolean; min_amount: number; max_amount: number;
}

export default function Dashboard() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/trades")
      .then((r) => r.json())
      .then((d) => { setTrades(d.trades ?? []); setSource(d.source); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? trades : trades.filter(t => t.type === filter);
  const buys = trades.filter(t => t.type === "Buy").length;
  const sells = trades.filter(t => t.type === "Sell").length;

  if (loading) return <div style={{color:"#fff",padding:"40px"}}>Fetching live trades from Quiver Quant…</div>;

  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 20px"}}>
      <h1 style={{fontFamily:"'Bebas Neue'",fontSize:32,letterSpacing:1,marginBottom:4}}>
        🇺🇸 TRUMP TRADE TRACKER
      </h1>
      <p style={{fontSize:12,color:"var(--text3)",marginBottom:24}}>
        Live OGE Form 278-T data via Quiver Quantitative · Source: <strong style={{color:"var(--text2)"}}>{source}</strong>
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12,marginBottom:28}}>
        {[
          {label:"Total Trades",value:trades.length,color:"var(--text)"},
          {label:"Purchases",value:buys,color:"var(--green)"},
          {label:"Sales",value:sells,color:"var(--red)"},
        ].map(s=>(
          <div key={s.label} style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:16}}>
            <div style={{fontSize:10,color:"var(--text3)",textTransform:"uppercase",letterSpacing:.7,marginBottom:4}}>{s.label}</div>
            <div style={{fontFamily:"'Bebas Neue'",fontSize:38,color:s.color}}>{s.value.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:6,marginBottom:16}}>
        {["all","Buy","Sell"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{
            padding:"5px 14px",borderRadius:99,fontSize:12,fontWeight:600,cursor:"pointer",border:"1px solid var(--border)",
            background:filter===f?"var(--surface3)":"var(--surface2)",
            color:f==="Buy"?"var(--green)":f==="Sell"?"var(--red)":"var(--text2)"
          }}>{f==="all"?"All":f}</button>
        ))}
      </div>

      <div style={{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,overflow:"hidden"}}>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr>{["Ticker","Type","Amount Range","Trade Date","Filed","Late?"].map(h=>(
                <th key={h} style={{padding:"9px 16px",textAlign:"left",fontSize:10,fontWeight:600,color:"var(--text3)",textTransform:"uppercase",borderBottom:"1px solid var(--border)",letterSpacing:.6}}>{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {filtered.slice(0,100).map((t,i)=>(
                <tr key={i} style={{borderBottom:"1px solid var(--border)"}}>
                  <td style={{padding:"10px 16px",fontFamily:"'Bebas Neue'",fontSize:18}}>{t.ticker}</td>
                  <td style={{padding:"10px 16px"}}>
                    <span style={{padding:"3px 10px",borderRadius:99,fontSize:11,fontWeight:700,
                      background:t.type==="Buy"?"rgba(34,197,94,.15)":"rgba(239,68,68,.15)",
                      color:t.type==="Buy"?"var(--green)":"var(--red)"}}>
                      {t.type==="Buy"?"🟢 Buy":"🔴 Sell"}
                    </span>
                  </td>
                  <td style={{padding:"10px 16px",fontSize:12,color:"var(--text2)"}}>{t.range}</td>
                  <td style={{padding:"10px 16px",fontSize:12,color:"var(--text2)"}}>{t.trade_date}</td>
                  <td style={{padding:"10px 16px",fontSize:12,color:"var(--text2)"}}>{t.filed_date}</td>
                  <td style={{padding:"10px 16px"}}>
                    {t.late && <span style={{fontSize:10,background:"rgba(245,158,11,.15)",color:"var(--gold)",border:"1px solid rgba(245,158,11,.3)",padding:"2px 7px",borderRadius:99}}>LATE</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{marginTop:24,padding:20,background:"rgba(37,211,102,.05)",border:"1px solid rgba(37,211,102,.2)",borderRadius:12}}>
        <h3 style={{fontSize:14,fontWeight:700,marginBottom:6}}>📱 WhatsApp Alerts</h3>
        <p style={{fontSize:12,color:"var(--text2)",marginBottom:10}}>Get notified the moment a new trade is disclosed. Powered by OpenWA or Twilio.</p>
        <WASubscribeForm />
      </div>
    </div>
  );
}

function WASubscribeForm() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"done">("idle");
  const submit = async () => {
    setStatus("loading");
    await fetch("/api/notify",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({phone})});
    setStatus("done");
  };
  if (status==="done") return <div style={{color:"#25d366",fontSize:13}}>✅ Subscribed! Check WhatsApp for confirmation.</div>;
  return (
    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
      <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 (555) 000-0000"
        style={{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,padding:"8px 12px",fontSize:13,color:"var(--text)",flex:1,minWidth:200,outline:"none"}}/>
      <button onClick={submit} disabled={status==="loading" || !phone}
        style={{background:"#25d366",color:"#fff",fontWeight:700,fontSize:13,padding:"8px 18px",borderRadius:8,cursor:"pointer",border:"none"}}>
        {status==="loading"?"Subscribing…":"Subscribe"}
      </button>
    </div>
  );
}
