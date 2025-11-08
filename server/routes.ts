import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./db-storage";
import { filterSchema, type WSMessage } from "@shared/schema";
import { trendsToCSV, accountsToCSV, generateExportFilename } from "./export-utils";

export async function registerRoutes(app: Express): Promise<Server> {
  // GET /api/trends - Get all trends with filters
  app.get("/api/trends", async (req, res) => {
    try {
      const filters = filterSchema.parse({
        cities: req.query.cities
          ? Array.isArray(req.query.cities)
            ? req.query.cities
            : [req.query.cities]
          : [],
        excludeBots: req.query.excludeBots === "true",
        timeRange: req.query.timeRange || "24h",
        minEngagement: req.query.minEngagement
          ? parseInt(req.query.minEngagement as string)
          : 0,
      });

      const trends = await storage.getTrends(filters);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching trends:", error);
      res.status(500).json({ error: "Failed to fetch trends" });
    }
  });

  // GET /api/trends/:id - Get single trend
  app.get("/api/trends/:id", async (req, res) => {
    try {
      const trend = await storage.getTrendById(req.params.id);
      if (!trend) {
        return res.status(404).json({ error: "Trend not found" });
      }
      res.json(trend);
    } catch (error) {
      console.error("Error fetching trend:", error);
      res.status(500).json({ error: "Failed to fetch trend" });
    }
  });

  // GET /api/accounts/top - Get top accounts
  app.get("/api/accounts/top", async (_req, res) => {
    try {
      const accounts = await storage.getTopAccounts(20);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching top accounts:", error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  // GET /api/accounts - Get accounts by trend
  app.get("/api/accounts", async (req, res) => {
    try {
      const trendId = req.query.trendId as string | undefined;
      const accounts = await storage.getAccounts(trendId);
      res.json(accounts);
    } catch (error) {
      console.error("Error fetching accounts:", error);
      res.status(500).json({ error: "Failed to fetch accounts" });
    }
  });

  // GET /api/trends/:id/history - Get historical snapshots for a trend
  app.get("/api/trends/:id/history", async (req, res) => {
    try {
      const { id } = req.params;
      const hours = req.query.hours ? parseInt(req.query.hours as string) : 24;
      
      // Validate hours parameter (1-720 hours = 1 hour to 30 days)
      if (isNaN(hours) || hours < 1 || hours > 720) {
        return res.status(400).json({ 
          error: "Invalid hours parameter. Must be between 1 and 720." 
        });
      }
      
      const snapshots = await storage.getSnapshotsByTrend(id, hours);
      res.json(snapshots);
    } catch (error) {
      console.error("Error fetching trend history:", error);
      res.status(500).json({ error: "Failed to fetch trend history" });
    }
  });

  // GET /api/export/trends/csv - Export trends as CSV
  app.get("/api/export/trends/csv", async (req, res) => {
    try {
      const filters = filterSchema.parse({
        cities: req.query.cities
          ? Array.isArray(req.query.cities)
            ? req.query.cities
            : [req.query.cities]
          : [],
        excludeBots: req.query.excludeBots === "true",
        timeRange: req.query.timeRange || "24h",
        minEngagement: req.query.minEngagement
          ? parseInt(req.query.minEngagement as string)
          : 0,
      });

      const trends = await storage.getTrends(filters);
      const csv = trendsToCSV(trends);
      const filename = generateExportFilename("trends", "csv");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting trends to CSV:", error);
      res.status(500).json({ error: "Failed to export trends" });
    }
  });

  // GET /api/export/trends/json - Export trends as JSON
  app.get("/api/export/trends/json", async (req, res) => {
    try {
      const filters = filterSchema.parse({
        cities: req.query.cities
          ? Array.isArray(req.query.cities)
            ? req.query.cities
            : [req.query.cities]
          : [],
        excludeBots: req.query.excludeBots === "true",
        timeRange: req.query.timeRange || "24h",
        minEngagement: req.query.minEngagement
          ? parseInt(req.query.minEngagement as string)
          : 0,
      });

      const trends = await storage.getTrends(filters);
      const filename = generateExportFilename("trends", "json");

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.json(trends);
    } catch (error) {
      console.error("Error exporting trends to JSON:", error);
      res.status(500).json({ error: "Failed to export trends" });
    }
  });

  // GET /api/export/accounts/csv - Export top accounts as CSV
  app.get("/api/export/accounts/csv", async (_req, res) => {
    try {
      const accounts = await storage.getTopAccounts(100); // Export top 100 accounts
      const csv = accountsToCSV(accounts);
      const filename = generateExportFilename("accounts", "csv");

      res.setHeader("Content-Type", "text/csv; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.send(csv);
    } catch (error) {
      console.error("Error exporting accounts to CSV:", error);
      res.status(500).json({ error: "Failed to export accounts" });
    }
  });

  // GET /api/export/accounts/json - Export top accounts as JSON
  app.get("/api/export/accounts/json", async (_req, res) => {
    try {
      const accounts = await storage.getTopAccounts(100); // Export top 100 accounts
      const filename = generateExportFilename("accounts", "json");

      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      res.json(accounts);
    } catch (error) {
      console.error("Error exporting accounts to JSON:", error);
      res.status(500).json({ error: "Failed to export accounts" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws: WebSocket) => {
    console.log("✅ WebSocket client connected");

    // Send initial connection message
    const connectedMessage: WSMessage = {
      type: "connected",
      data: {
        message: "Connected to Saudi Trends Analyzer",
      },
    };
    ws.send(JSON.stringify(connectedMessage));

    // Send initial trends data
    storage.getTrends().then((trends) => {
      const updateMessage: WSMessage = {
        type: "trends_update",
        data: {
          trends,
          timestamp: new Date().toISOString(),
        },
      };
      ws.send(JSON.stringify(updateMessage));
    });

    ws.on("close", () => {
      console.log("❌ WebSocket client disconnected");
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  // Broadcast updates to all connected clients every 60 seconds
  setInterval(async () => {
    // Update trends with random changes to simulate real-time data
    await storage.updateTrendsRandomly();

    const trends = await storage.getTrends();
    
    const updateMessage: WSMessage = {
      type: "trends_update",
      data: {
        trends,
        timestamp: new Date().toISOString(),
      },
    };

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(updateMessage));
      }
    });

    console.log(`📡 Broadcasted update to ${wss.clients.size} clients`);
  }, 60000); // Every 60 seconds

  // Capture historical snapshots every 5 minutes
  setInterval(async () => {
    try {
      await storage.captureSnapshots();
      console.log("📸 Captured historical snapshot");
    } catch (error) {
      console.error("Error capturing snapshot:", error);
    }
  }, 5 * 60 * 1000); // Every 5 minutes

  // Cleanup old snapshots daily (keep last 30 days)
  setInterval(async () => {
    try {
      await storage.cleanupOldSnapshots();
      console.log("🧹 Cleaned up old snapshots");
    } catch (error) {
      console.error("Error cleaning up snapshots:", error);
    }
  }, 24 * 60 * 60 * 1000); // Every 24 hours

  return httpServer;
}
