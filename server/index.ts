import express from "express";
import { getSaudiTrends } from "./trends"; // دالة الجلب اللي عندك
// ملاحظة: لا WebSocket ولا seed ولا registerRoutes هنا — Vercel Serverless.

const app = express();

// صحّة
app.get("/health", (_req, res) => {
  const simulated = process.env.USE_SIMULATED === "true";
  res.json({ ok: true, source: simulated ? "simulated" : "trends24" });
});

// API الترندات (بدون DB)
app.get("/api/trends", async (_req, res) => {
  try {
    if (process.env.USE_SIMULATED === "true") {
      return res.json({ trends: ["#مثال1", "#مثال2", "#مثال3"] });
    }
    const trends = await getSaudiTrends();
    res.json({ trends });
  } catch (e) {
    res.status(502).json({ trends: [], error: "fetch_failed" });
  }
});

// ✅ تصدير هاندلر واحد لـ Vercel
export default (req: any, res: any) => app(req, res);
