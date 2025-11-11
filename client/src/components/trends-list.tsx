import React, { useEffect, useState } from "react";
import TrendCard from "./trend-card";
type Resp = { trends: string[] };

export default function TrendsList() {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const r = await fetch("/api/trends");
      const data: Resp = await r.json();
      setTrends(data.trends || []);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); const id=setInterval(load,60_000); return ()=>clearInterval(id); }, []);
  if (loading) return <div>جاري التحديث...</div>;
  return <div className="grid gap-3">{trends.map(t => <TrendCard key={t} trend={{ hashtag: t }} />)}</div>;
}
