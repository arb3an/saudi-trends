import {
  type Trend,
  type InsertTrend,
  type Account,
  type InsertAccount,
  type Post,
  type InsertPost,
  type Filters,
  type TrendWithAccounts,
  type InsertSnapshot,
  trends,
  accounts,
  posts,
  snapshots,
  saudiCities,
} from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, desc, sql, and, inArray, gte } from "drizzle-orm";
import type { IStorage } from "./storage";

const databaseUrl = process.env.DATABASE_URL!;
const connection = neon(databaseUrl);
export const db = drizzle(connection);

export class DbStorage implements IStorage {
  // Trends
  async getTrends(filters?: Filters): Promise<TrendWithAccounts[]> {
    // Fetch all trends sorted by rank
    let trendsQuery = db
      .select()
      .from(trends)
      .orderBy(trends.rank);

    let allTrends = await trendsQuery;

    // Apply engagement filter
    if (filters?.minEngagement) {
      allTrends = allTrends.filter(
        (t) => t.retweets + t.likes + t.comments >= filters.minEngagement
      );
    }

    // Build TrendWithAccounts
    const trendsWithAccounts: TrendWithAccounts[] = [];

    for (const trend of allTrends) {
      // Get accounts for this trend
      let accountsQuery = db
        .select()
        .from(accounts)
        .where(eq(accounts.trendId, trend.id));

      let trendAccounts = await accountsQuery;

      // Apply filters
      if (filters?.excludeBots) {
        trendAccounts = trendAccounts.filter((a) => !a.isBot);
      }

      if (filters?.cities && filters.cities.length > 0) {
        trendAccounts = trendAccounts.filter(
          (a) => a.city && filters.cities!.includes(a.city)
        );
      }

      // Skip trend if city filter applied but no matching accounts
      if (filters?.cities && filters.cities.length > 0 && trendAccounts.length === 0) {
        continue;
      }

      // Get top 5 accounts by followers
      const topAccounts = trendAccounts
        .sort((a, b) => b.followers - a.followers)
        .slice(0, 5);

      // Calculate total engagement
      const totalEngagement = trend.retweets + trend.likes + trend.comments;

      // Build city distribution
      const cityDistribution: Record<string, number> = {};
      trendAccounts.forEach((account) => {
        if (account.city) {
          cityDistribution[account.city] =
            (cityDistribution[account.city] || 0) + 1;
        }
      });

      trendsWithAccounts.push({
        ...trend,
        topAccounts,
        totalEngagement,
        cityDistribution,
      });
    }

    return trendsWithAccounts;
  }

  async getTrendById(id: string): Promise<Trend | undefined> {
    const result = await db.select().from(trends).where(eq(trends.id, id)).limit(1);
    return result[0];
  }

  async createTrend(insertTrend: InsertTrend): Promise<Trend> {
    const result = await db.insert(trends).values(insertTrend).returning();
    return result[0];
  }

  async updateTrend(
    id: string,
    updates: Partial<InsertTrend>
  ): Promise<Trend | undefined> {
    const result = await db
      .update(trends)
      .set({ ...updates, lastUpdated: new Date() })
      .where(eq(trends.id, id))
      .returning();
    return result[0];
  }

  // Accounts
  async getAccounts(trendId?: string): Promise<Account[]> {
    if (trendId) {
      return await db.select().from(accounts).where(eq(accounts.trendId, trendId));
    }
    return await db.select().from(accounts);
  }

  async getTopAccounts(limit = 20): Promise<Account[]> {
    return await db
      .select()
      .from(accounts)
      .where(eq(accounts.isBot, false))
      .orderBy(desc(accounts.followers))
      .limit(limit);
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
    return result[0];
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const result = await db.insert(accounts).values(insertAccount).returning();
    return result[0];
  }

  // Posts
  async getPostsByTrend(trendId: string): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.trendId, trendId));
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(insertPost).returning();
    return result[0];
  }

  // Snapshots (for historical tracking)
  async createSnapshot(insertSnapshot: InsertSnapshot): Promise<void> {
    await db.insert(snapshots).values(insertSnapshot);
  }

  async getSnapshotsByTrend(trendId: string, hoursBack: number = 24): Promise<any[]> {
    const cutoffTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
    return await db
      .select()
      .from(snapshots)
      .where(
        and(
          eq(snapshots.trendId, trendId),
          gte(snapshots.capturedAt, cutoffTime)
        )
      )
      .orderBy(snapshots.capturedAt);
  }

  // Helper method to capture current state as snapshot
  async captureSnapshots(): Promise<void> {
    const allTrends = await db.select().from(trends);
    
    const snapshotData = allTrends.map((trend) => ({
      trendId: trend.id,
      hashtag: trend.hashtag,
      rank: trend.rank,
      tweetCount: trend.tweetCount,
      retweets: trend.retweets,
      likes: trend.likes,
      comments: trend.comments,
    }));

    if (snapshotData.length > 0) {
      await db.insert(snapshots).values(snapshotData);
    }
  }

  // Cleanup old snapshots (keep only last 30 days)
  async cleanupOldSnapshots(): Promise<void> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await db.delete(snapshots).where(
      sql`${snapshots.capturedAt} < ${thirtyDaysAgo}`
    );
  }

  // Method to update trends randomly (for testing/demo purposes)
  async updateTrendsRandomly(): Promise<void> {
    const allTrends = await db.select().from(trends);
    
    for (const trend of allTrends) {
      const velocityChange = Math.floor(Math.random() * 200) - 100;
      const newVelocity = Math.max(-500, Math.min(500, trend.velocity + velocityChange));
      const newTweetCount = Math.max(0, trend.tweetCount + newVelocity);
      
      await db
        .update(trends)
        .set({
          velocity: newVelocity,
          tweetCount: newTweetCount,
          retweets: Math.max(0, trend.retweets + Math.floor(Math.random() * 50) - 25),
          likes: Math.max(0, trend.likes + Math.floor(Math.random() * 100) - 50),
          comments: Math.max(0, trend.comments + Math.floor(Math.random() * 30) - 15),
          lastUpdated: new Date(),
        })
        .where(eq(trends.id, trend.id));
    }
  }
}

export const storage = new DbStorage();
