import express, { type Request, Response, NextFunction } from "express";
import type { Express } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { getSaudiTrends } from "./trends"; // لازم تكون كل الـ imports بالأعلى

// أنشئ التطبيق
const app: Express = express();

// إعداد body parsers + لوج مبسّط لطلبات /api
declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

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

// مسارات بسيطة قبل تشغيل السيرفر

app.get("/health", (_req, res) => {
  const simulated = process.env.USE_SIMULATED === "true";
  res.json({ source: simulated ? "simulated" : "trends24" });
});

app.get("/api/trends", async (_req, res) => {
  try {
    if (process.env.USE_SIMULATED === "true") {
      return res.json({ trends: ["#مثال1", "#مثال2", "#مثال3"] });
    }
    const trends = await getSaudiTrends();
    res.json({ trends });
  } catch {
    res.status(502).json({ trends: [], error: "fetch_failed" });
  }
});

// لا تستخدم seeding هنا نهائيًا (كانت تسبب خطأ seedDatabase غير معرّف)
// لو احتجتها لاحقًا نرجعها بشكل سليم مع import صحيح

// شغّل كل شيء
(async () => {
  // لو عندك REST routes إضافية من ملف routes.ts
  const server = await registerRoutes(app);

  // في التطوير: شغّل Vite middleware
  // في الإنتاج: قدّم ملفات الواجهة الجاهزة من dist/client
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // منفذ Render (إجباري)
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    }
  );
})().catch((err) => {
  console.error("Fatal boot error:", err);
  process.exit(1);
});
