import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Trending Topics Schema
export const trends = pgTable("trends", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  hashtag: text("hashtag").notNull(),
  rank: integer("rank").notNull(),
  tweetCount: integer("tweet_count").notNull(),
  velocity: integer("velocity").notNull(), // Change in tweet count (positive/negative)
  retweets: integer("retweets").notNull(),
  likes: integer("likes").notNull(),
  comments: integer("comments").notNull(),
  sentimentPositive: integer("sentiment_positive").notNull().default(0), // Percentage 0-100
  sentimentNegative: integer("sentiment_negative").notNull().default(0), // Percentage 0-100
  sentimentNeutral: integer("sentiment_neutral").notNull().default(0), // Percentage 0-100
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertTrendSchema = createInsertSchema(trends).omit({
  id: true,
  lastUpdated: true,
});

export type InsertTrend = z.infer<typeof insertTrendSchema>;
export type Trend = typeof trends.$inferSelect;

// Accounts Schema
export const accounts = pgTable("accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull(),
  displayName: text("display_name").notNull(),
  avatar: text("avatar").notNull(),
  verified: boolean("verified").notNull().default(false),
  isBot: boolean("is_bot").notNull().default(false),
  city: text("city"),
  followers: integer("followers").notNull(),
  trendId: varchar("trend_id").references(() => trends.id),
});

export const insertAccountSchema = createInsertSchema(accounts).omit({
  id: true,
});

export type InsertAccount = z.infer<typeof insertAccountSchema>;
export type Account = typeof accounts.$inferSelect;

// Posts Schema
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  accountId: varchar("account_id").references(() => accounts.id).notNull(),
  trendId: varchar("trend_id").references(() => trends.id).notNull(),
  retweets: integer("retweets").notNull(),
  likes: integer("likes").notNull(),
  comments: integer("comments").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  timestamp: true,
});

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

// Historical Snapshots Schema (for trend analytics over time)
export const snapshots = pgTable("snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  trendId: varchar("trend_id").references(() => trends.id).notNull(),
  hashtag: text("hashtag").notNull(),
  rank: integer("rank").notNull(),
  tweetCount: integer("tweet_count").notNull(),
  retweets: integer("retweets").notNull(),
  likes: integer("likes").notNull(),
  comments: integer("comments").notNull(),
  capturedAt: timestamp("captured_at").notNull().defaultNow(),
});

export const insertSnapshotSchema = createInsertSchema(snapshots).omit({
  id: true,
  capturedAt: true,
});

export type InsertSnapshot = z.infer<typeof insertSnapshotSchema>;
export type Snapshot = typeof snapshots.$inferSelect;

// Saudi Cities Data (for filters and map)
export const saudiCities = [
  { name: "الرياض", nameEn: "Riyadh", lat: 24.7136, lng: 46.6753, region: "central" },
  { name: "جدة", nameEn: "Jeddah", lat: 21.5433, lng: 39.1728, region: "western" },
  { name: "مكة المكرمة", nameEn: "Makkah", lat: 21.4225, lng: 39.8262, region: "western" },
  { name: "المدينة المنورة", nameEn: "Madinah", lat: 24.5247, lng: 39.5692, region: "western" },
  { name: "الدمام", nameEn: "Dammam", lat: 26.4207, lng: 50.0888, region: "eastern" },
  { name: "الخبر", nameEn: "Khobar", lat: 26.2172, lng: 50.1971, region: "eastern" },
  { name: "الظهران", nameEn: "Dhahran", lat: 26.2361, lng: 50.0393, region: "eastern" },
  { name: "الطائف", nameEn: "Taif", lat: 21.2703, lng: 40.4158, region: "western" },
  { name: "تبوك", nameEn: "Tabuk", lat: 28.3838, lng: 36.5550, region: "northern" },
  { name: "بريدة", nameEn: "Buraidah", lat: 26.3260, lng: 43.9750, region: "central" },
  { name: "أبها", nameEn: "Abha", lat: 18.2164, lng: 42.5053, region: "southern" },
  { name: "خميس مشيط", nameEn: "Khamis Mushait", lat: 18.3063, lng: 42.7291, region: "southern" },
  { name: "حائل", nameEn: "Hail", lat: 27.5219, lng: 41.6901, region: "northern" },
  { name: "نجران", nameEn: "Najran", lat: 17.5648, lng: 44.2290, region: "southern" },
  { name: "الجبيل", nameEn: "Jubail", lat: 27.0174, lng: 49.6251, region: "eastern" },
  { name: "ينبع", nameEn: "Yanbu", lat: 24.0896, lng: 38.0618, region: "western" },
] as const;

export type SaudiCity = typeof saudiCities[number];

// Filters Schema
export const filterSchema = z.object({
  cities: z.array(z.string()).default([]),
  excludeBots: z.boolean().default(true),
  timeRange: z.enum(["1h", "6h", "12h", "24h", "7d"]).default("24h"),
  minEngagement: z.number().min(0).default(0),
});

export type Filters = z.infer<typeof filterSchema>;

// Aggregated trend data with accounts
export type TrendWithAccounts = Trend & {
  topAccounts: Account[];
  totalEngagement: number;
  cityDistribution: Record<string, number>;
};

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("trends_update"),
    data: z.object({
      trends: z.array(z.any()),
      timestamp: z.string(),
    }),
  }),
  z.object({
    type: z.literal("new_trend"),
    data: z.object({
      trend: z.any(),
      timestamp: z.string(),
    }),
  }),
  z.object({
    type: z.literal("connected"),
    data: z.object({
      message: z.string(),
    }),
  }),
]);

export type WSMessage = z.infer<typeof wsMessageSchema>;
