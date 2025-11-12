import React, { useEffect, useState } from "react";

export default function TrendsList() {
  const [trends, setTrends] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  async function load() {
    try {
      const res = await fetch("/api/trends");
      const data = await res.json();
      // أحياناً السيرفر يرجع trends داخل كائن، نتأكد هنا
      const list = Array.isArray(data) ? data : data.trends || [];
      setTrends(list);
    } catch (e) {
      console.error(e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // يحدث كل دقيقة
    return () => clearInterval(id);
  }, []);

  if (loading) return <div>جاري تحميل الترندات...</div>;
  if (error) return <div>تعذّر تحميل الترندات الآن</div>;

  return (
    <div style={{ padding: "20px" }}>
      {trends.map((t) => (
        <div key={t} style={{ marginBottom: "10px" }}>
          <a
            href={`https://twitter.com/hashtag/${encodeURIComponent(t.replace("#", ""))}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "blue", textDecoration: "underline" }}
            dir="ltr"
          >
            {t}
          </a>
        </div>
      ))}
    </div>
  );
}
