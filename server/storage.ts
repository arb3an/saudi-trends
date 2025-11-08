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
} from "@shared/schema";

/**
 * Storage interface for the application.
 * NOTE: This project uses DbStorage (PostgreSQL) implementation in db-storage.ts
 * MemStorage (in-memory) was removed as it's no longer needed.
 */
export interface IStorage {
  // Trends
  getTrends(filters?: Filters): Promise<TrendWithAccounts[]>;
  getTrendById(id: string): Promise<Trend | undefined>;
  createTrend(trend: InsertTrend): Promise<Trend>;
  updateTrend(id: string, trend: Partial<InsertTrend>): Promise<Trend | undefined>;

  // Accounts
  getAccounts(trendId?: string): Promise<Account[]>;
  getTopAccounts(limit?: number): Promise<Account[]>;
  getAccountById(id: string): Promise<Account | undefined>;
  createAccount(account: InsertAccount): Promise<Account>;

  // Posts
  getPostsByTrend(trendId: string): Promise<Post[]>;
  createPost(post: InsertPost): Promise<Post>;
}
