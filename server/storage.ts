import {
  type Trend,
  type InsertTrend,
  type Account,
  type InsertAccount,
  type Post,
  type InsertPost,
  type Filters,
  type TrendWithAccounts,
  saudiCities,
} from "@shared/schema";
import { randomUUID } from "crypto";

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

export class MemStorage implements IStorage {
  private trends: Map<string, Trend>;
  private accounts: Map<string, Account>;
  private posts: Map<string, Post>;

  constructor() {
    this.trends = new Map();
    this.accounts = new Map();
    this.posts = new Map();
    this.seedMockData();
  }

  // Trends
  async getTrends(filters?: Filters): Promise<TrendWithAccounts[]> {
    let trends = Array.from(this.trends.values());

    // Sort by rank
    trends = trends.sort((a, b) => a.rank - b.rank);

    // Apply filters
    if (filters?.minEngagement) {
      trends = trends.filter(
        (t) =>
          t.retweets + t.likes + t.comments >= filters.minEngagement
      );
    }

    // Build TrendWithAccounts
    const trendsWithAccounts: TrendWithAccounts[] = [];
    
    for (const trend of trends) {
      const topAccounts = Array.from(this.accounts.values())
        .filter((a) => a.trendId === trend.id)
        .filter((a) => !filters?.excludeBots || !a.isBot)
        .filter((a) => {
          if (!filters?.cities || filters.cities.length === 0) return true;
          return a.city && filters.cities.includes(a.city);
        })
        .slice(0, 5);

      // If city filter is applied and no accounts match, skip this trend
      if (filters?.cities && filters.cities.length > 0 && topAccounts.length === 0) {
        continue;
      }

      const totalEngagement = trend.retweets + trend.likes + trend.comments;

      const cityDistribution: Record<string, number> = {};
      const trendAccounts = Array.from(this.accounts.values()).filter(
        (a) => a.trendId === trend.id
      );
      
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
    return this.trends.get(id);
  }

  async createTrend(insertTrend: InsertTrend): Promise<Trend> {
    const id = randomUUID();
    const trend: Trend = {
      ...insertTrend,
      id,
      lastUpdated: new Date(),
    };
    this.trends.set(id, trend);
    return trend;
  }

  async updateTrend(
    id: string,
    updates: Partial<InsertTrend>
  ): Promise<Trend | undefined> {
    const trend = this.trends.get(id);
    if (!trend) return undefined;

    const updated: Trend = {
      ...trend,
      ...updates,
      lastUpdated: new Date(),
    };
    this.trends.set(id, updated);
    return updated;
  }

  // Accounts
  async getAccounts(trendId?: string): Promise<Account[]> {
    let accounts = Array.from(this.accounts.values());
    if (trendId) {
      accounts = accounts.filter((a) => a.trendId === trendId);
    }
    return accounts;
  }

  async getTopAccounts(limit = 20): Promise<Account[]> {
    return Array.from(this.accounts.values())
      .filter((a) => !a.isBot)
      .sort((a, b) => b.followers - a.followers)
      .slice(0, limit);
  }

  async getAccountById(id: string): Promise<Account | undefined> {
    return this.accounts.get(id);
  }

  async createAccount(insertAccount: InsertAccount): Promise<Account> {
    const id = randomUUID();
    const account: Account = { ...insertAccount, id };
    this.accounts.set(id, account);
    return account;
  }

  // Posts
  async getPostsByTrend(trendId: string): Promise<Post[]> {
    return Array.from(this.posts.values()).filter(
      (p) => p.trendId === trendId
    );
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      timestamp: new Date(),
    };
    this.posts.set(id, post);
    return post;
  }

  // Seed mock data
  private seedMockData() {
    const saudiHashtags = [
      "السعودية_اليوم",
      "الرياض",
      "جدة",
      "رؤية_2030",
      "نيوم",
      "الهلال",
      "النصر",
      "الاتحاد",
      "موسم_الرياض",
      "الخليج_العربي",
      "البحر_الأحمر",
      "القدية",
      "الدرعية",
      "السعودية_الخضراء",
      "المدينة_المنورة",
      "مكة_المكرمة",
      "الشرقية",
      "عسير",
      "تبوك",
      "حائل",
    ];

    const arabicNames = [
      "محمد العتيبي",
      "سارة القحطاني",
      "عبدالله السبيعي",
      "نورة المطيري",
      "خالد الدوسري",
      "فاطمة الشمري",
      "عمر الغامدي",
      "منى الحربي",
      "أحمد الزهراني",
      "ريم العنزي",
      "سلطان الشهري",
      "لينا القرشي",
      "يوسف العمري",
      "هند البقمي",
      "فهد الراشد",
      "دانة السديري",
      "ماجد الفيصل",
      "جواهر الخالدي",
      "طارق المالكي",
      "بدور السعيد",
    ];

    const usernames = [
      "saudi_voice",
      "riyadh_life",
      "jeddah_vibes",
      "ksa_today",
      "vision_sa",
      "neom_future",
      "alhilal_fan",
      "alnassr_pride",
      "makkah_news",
      "madinah_love",
      "eastern_saudi",
      "western_coast",
      "northern_star",
      "southern_pride",
      "central_region",
      "tech_saudi",
      "culture_ksa",
      "sports_ksa",
      "business_sa",
      "lifestyle_ksa",
    ];

    // Create trends
    const mockTrends: Trend[] = [];
    for (let i = 0; i < 12; i++) {
      const tweetCount = Math.floor(Math.random() * 50000) + 5000;
      const trend: Trend = {
        id: randomUUID(),
        hashtag: saudiHashtags[i],
        rank: i + 1,
        tweetCount,
        velocity: Math.floor(Math.random() * 2000) - 500,
        retweets: Math.floor(tweetCount * 0.3),
        likes: Math.floor(tweetCount * 0.6),
        comments: Math.floor(tweetCount * 0.1),
        lastUpdated: new Date(),
      };
      mockTrends.push(trend);
      this.trends.set(trend.id, trend);
    }

    // Create accounts for each trend
    mockTrends.forEach((trend, trendIndex) => {
      const accountsPerTrend = 5 + Math.floor(Math.random() * 5);
      
      for (let i = 0; i < accountsPerTrend; i++) {
        const cityData = saudiCities[Math.floor(Math.random() * saudiCities.length)];
        const nameIndex = (trendIndex * 5 + i) % arabicNames.length;
        const usernameIndex = (trendIndex * 5 + i) % usernames.length;
        
        const account: Account = {
          id: randomUUID(),
          username: usernames[usernameIndex] + (i > 0 ? i : ""),
          displayName: arabicNames[nameIndex],
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${usernames[usernameIndex]}${i}`,
          verified: Math.random() > 0.7,
          isBot: Math.random() > 0.85,
          city: cityData.nameEn,
          followers: Math.floor(Math.random() * 500000) + 1000,
          trendId: trend.id,
        };
        this.accounts.set(account.id, account);
      }
    });

    console.log(`✅ Seeded ${this.trends.size} trends and ${this.accounts.size} accounts`);
  }

  // Update trends with random changes (for real-time simulation)
  updateTrendsRandomly() {
    const trends = Array.from(this.trends.values());
    
    trends.forEach((trend) => {
      const velocityChange = Math.floor(Math.random() * 400) - 200;
      const tweetCountChange = Math.max(0, Math.floor(Math.random() * 1000) - 200);
      
      const updated: Trend = {
        ...trend,
        tweetCount: trend.tweetCount + tweetCountChange,
        velocity: trend.velocity + velocityChange,
        retweets: trend.retweets + Math.floor(tweetCountChange * 0.3),
        likes: trend.likes + Math.floor(tweetCountChange * 0.6),
        comments: trend.comments + Math.floor(tweetCountChange * 0.1),
        lastUpdated: new Date(),
      };
      
      this.trends.set(trend.id, updated);
    });
  }
}

export const storage = new MemStorage();
