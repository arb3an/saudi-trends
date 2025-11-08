import { db } from "./db-storage";
import { trends, accounts } from "@shared/schema";
import { sql } from "drizzle-orm";
import { analyzeHashtagSentiment } from "./sentiment-analyzer";

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
  "vision2030_fan",
  "neom_explorer",
  "alhilal_fan1",
  "alnasser_supporter",
  "alittihad_pride",
  "riyadh_season",
  "saudi_culture",
  "ksa_sports",
  "makkah_life",
  "madinah_news",
  "eastern_province",
  "western_region",
  "northern_star2",
  "southern_pride3",
  "central_ksa",
  "culture_ksa1",
  "sports_ksa7",
];

const cities = [
  "Riyadh",
  "Jeddah",
  "Makkah",
  "Madinah",
  "Dammam",
  "Khobar",
  "Taif",
  "Tabuk",
  "Buraidah",
  "Abha",
  "Hail",
  "Najran",
  "Jubail",
];

export async function seedDatabase() {
  try {
    // Check if data already exists
    const existingTrends = await db.select().from(trends).limit(1);
    if (existingTrends.length > 0) {
      console.log("✅ Database already seeded, skipping...");
      return;
    }

    console.log("🌱 Seeding database with Saudi trending data...");

    // Create trends
    const createdTrends = [];
    for (let i = 0; i < 12; i++) {
      const hashtag = saudiHashtags[i];
      const rank = i + 1;
      const tweetCount = Math.floor(Math.random() * 50000) + 10000;
      const velocity = Math.floor(Math.random() * 1000) - 500;

      // Analyze sentiment for this hashtag
      const sentiment = analyzeHashtagSentiment(hashtag);

      const result = await db
        .insert(trends)
        .values({
          hashtag: `#${hashtag}`,
          rank,
          tweetCount,
          velocity,
          retweets: Math.floor(Math.random() * 10000) + 1000,
          likes: Math.floor(Math.random() * 20000) + 2000,
          comments: Math.floor(Math.random() * 5000) + 500,
          sentimentPositive: sentiment.positive,
          sentimentNegative: sentiment.negative,
          sentimentNeutral: sentiment.neutral,
        })
        .returning();

      createdTrends.push(result[0]);
    }

    // Create accounts for each trend
    let totalAccounts = 0;
    for (const trend of createdTrends) {
      const accountCount = Math.floor(Math.random() * 4) + 5; // 5-8 accounts per trend

      for (let i = 0; i < accountCount; i++) {
        const nameIndex = Math.floor(Math.random() * arabicNames.length);
        const usernameIndex = Math.floor(Math.random() * usernames.length);
        const cityIndex = Math.floor(Math.random() * cities.length);

        await db.insert(accounts).values({
          username: usernames[usernameIndex] + (totalAccounts + i),
          displayName: arabicNames[nameIndex],
          avatar: `https://i.pravatar.cc/150?img=${(totalAccounts + i) % 70}`,
          verified: Math.random() > 0.7,
          isBot: Math.random() > 0.85, // 15% chance of bot
          city: cities[cityIndex],
          followers: Math.floor(Math.random() * 100000) + 1000,
          trendId: trend.id,
        });
      }

      totalAccounts += accountCount;
    }

    console.log(
      `✅ Seeded ${createdTrends.length} trends and ${totalAccounts} accounts`
    );

    // Capture initial snapshot for historical tracking
    const { storage } = await import("./db-storage");
    await storage.captureSnapshots();
    console.log("📸 Captured initial snapshot");
  } catch (error) {
    console.error("Error seeding database:", error);
    throw error;
  }
}
