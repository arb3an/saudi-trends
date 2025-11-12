// server/index.ts
import express, { type Request, Response, NextFunction } from "express";
import type { Express } from "express";
import type { Server } from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getSaudiTrends } from "./trends";

// إنشاء التطبيق
const app: Express = express();

// للسماح بقراءة الـ rawBody إن احتجناه
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

// بارس للجسم + لوج مبسّط لطلبات /api
app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    },
  })
);
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json.bind(res);
  (res as any).json = (bodyJson: any, ...args: any[]) => {
    capturedJsonResponse = bodyJson;
    return originalResJson(bodyJson, ...args);
  };

  res.on("finish", () => {
    if (path.startsWith("/api")) {
      const duration = Date.now() - start;
      let line = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) line += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      if (line.length > 80) line = line.slice(0, 79) + "…";
      log(line);
    }
  });

  next();
});

// ====== مسارات بسيطة تعمل دائماً (بدون DB / بدون Apify) ======

app.get("/health", (_req, res) => {
  const simulated = process.env.USE_SIMULATED === "true";
  res.json({ ok: true, source: simulated ? "simulated" : "trends24" });
});

app.get("/api/trends", async (_req, res) => {
  try {
    // وضع محاكاة مجاني (لو ما تبغى اتصال خارجي)
    if (process.env.USE_SIMULATED === "true") {
      return res.json({
        trends: ["#مثال1", "#مثال2", "#مثال3", "#TrendFree", "#KSA"],
      });
    }

    // جلب مباشر من موقع خارجي (بدون قاعدة بيانات)
    const trends = await getSaudiTrends();
    res.json({ trends });
  } catch {
    res.status(502).json({ trends: [], error: "fetch_failed" });
  }
});

// =============================================================

let serverRef: Server | null = null;

(async () => {
  // يسجّل بقية المسارات (الملف يرجّع Server مربوط على app)
  serverRef = await registerRoutes(app);

  // في التطوير نشغّل Vite ميدل وير، وفي الإنتاج نخدم ملفات الواجهة
  if (app.get("env") === "development") {
    await setupVite(app, serverRef);
  } else {
    serveStatic(app);
  }

  // على المنصات العادية نشغّل الاستماع للبورت
  // على Vercel لا نستمع؛ فقط نصدّر app بالأسفل
  if (!process.env.VERCEL) {
    const port = parseInt(process.env.PORT || "5000", 10);
    serverRef.listen(
      { port, host: "0.0.0.0", reusePort: true },
      () => log(`serving on port ${port}`)
    );
  }
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

// مهم لـ Vercel: صدّر التطبيق نفسه كـ handler
export default app;
