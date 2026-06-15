import { Suspense } from "react";
import Dashboard from "@/components/Dashboard";

export const revalidate = 3600;

export default function Home() {
  return (
    <main>
      <Suspense fallback={<div style={{color:"#fff",padding:"40px",fontFamily:"sans-serif"}}>Loading trades…</div>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}
