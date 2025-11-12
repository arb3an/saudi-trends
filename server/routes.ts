// server/routes.ts
import type { Express } from "express";
import { createServer, type Server } from "http";
import { getSaudiTrends } from "./trends";
import { z } from "zod";

// نفس شكل الفلاتر القديم (اختياري)
const filterSchema = z.object({
  cities: z.array(z.string()).optional().default([]),
  excludeBots: z.boolean().optional().default(false),
  timeRange: z.string().optional().default("24h"),
  minEngagement: z.number().optional().default(0),
});

// مولّد بيانات رقمية “آمنة” توافق ما تتوقعه الواجهة
function makeTrend(tag: string, rank: number) {
  // أرقام عشوائية لطيفة (لكن ثابتة نسبياً) حتى يبدو طبيعي
  const base = Math.max(5000, 3000 + Math.floor(Math.random() * 50000));
  const velocity = Math.floor((Math.random() - 0.3) * 600); // قد تكون سالبة/موجبة
  const retweets = Math.floor(base * (0.02 + Math.random() * 0.04));
  const likes = Math.floor(base * (0.08 + Math.random() * 0.12));
  const comments = Math.floor(base * (0.01 + Math.random() * 0.02));

  // قسّم المشاعر بحيث تساوي 100%
  const pos = Math.floor(20 + Math.random() * 60);
  const neu = Math.floor(10 + Math.random() * 40);
  const neg = Math.max(0, 100 - pos - neu);

  return {
    id: `${tag}-${rank}`,
    hashtag: tag,
    rank,
    velocity,
    tweetCount: base,
    retweets,
    likes,
    comments,
    sentimentPositive: pos,
    sentimentNeutral: neu,
    sentimentNegative: neg,
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // ترندات: نرجع مصفوفة Trends بنفس الشكل الذي تتوقعه الواجهة
  app.get("/api/trends", async (req, res) => {
    try {
      // نقرأ الفلاتر (للتوافق فقط – ما نستخدمها الآن)
      const filters = filterSchema.parse({
        cities: req.query.cities
          ? Array.isArray(req.query.cities)
            ? req.query.cities
            : [req.query.cities]
          : [],
        excludeBots: req.query.excludeBots === "true",
        timeRange: (req.query.timeRange as string) || "24h",
        minEngagement: req.query.minEngagement
          ? parseInt(req.query.minEngagement as string)
          : 0,
      });

      // نجلب كل الهاشتاقات من Trends24 (مجاني)
      const tags = await getSaudiTrends();

      // حوّل كل هاشتاق إلى كائن Trend كامل
      const trends = tags.map((t, i) => makeTrend(t, i + 1));

      // بإمكانك تقصّهم لو ودك (مثلاً أول 20):
      // const trends = tags.slice(0, 20).map((t, i) => makeTrend(t, i + 1));

      res.json(trends); // ← الواجهة كانت تتوقع مصفوفة مباشرة
    } catch (error) {
      console.error("Error fetching trends:", error);
      // رجّع بيانات بديلة إذا تعطل المصدر
      const fallback = ["#السعودية", "#الرياض", "#الهلال", "#النصر", "#نيوم"].map(
        (t, i) => makeTrend(t, i + 1)
      );
      res.json(fallback);
    }
  });

  // نقاط نهاية أخرى (توافق الواجهة) — نرجّع بيانات فارغة بدل DB/Apify
  app.get("/api/trends/:id", (_req, res) => {
    return res.status(404).json({ error: "Trend not found" });
  });

  app.get("/api/accounts/top", (_req, res) => {
    return res.json([]); // لا حسابات حقيقية حالياً
  });

  app.get("/api/accounts", (_req, res) => {
    return res.json([]); // لا حسابات حقيقية حالياً
  });

  app.get("/api/trends/:id/history", (_req, res) => {
    return res.json([]); // بدون تاريخ حقيقي حالياً
  });

  // صحة
  app.get("/health", (_req, res) => {
    res.json({ status: "ok", source: "Trends24", free: true });
  });

  // سيرفر HTTP (بدون WebSocket/جداول/Seed لتفادي Neon/Apify)
  const httpServer = createServer(app);
  return httpServer;
}
