import { storage } from "./db-storage";
import { detectBot } from "./bot-detector";

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

/**
 * Generate simulated accounts for a trend
 * Mimics the logic from server/seed.ts to ensure consistent account data
 */
export async function generateSimulatedAccounts(
  trendId: string,
  hashtag: string,
  accountCount: number = 5
): Promise<void> {
  try {
    console.log(`🤖 Generating ${accountCount} simulated accounts for ${hashtag}...`);
    for (let i = 0; i < accountCount; i++) {
      const nameIndex = Math.floor(Math.random() * arabicNames.length);
      const usernameIndex = Math.floor(Math.random() * usernames.length);
      const cityIndex = Math.floor(Math.random() * cities.length);
      
      const timestamp = Date.now();
      const username = `${usernames[usernameIndex]}_${timestamp}_${i}`;
      const verified = Math.random() > 0.7;
      const followers = Math.floor(Math.random() * 100000) + 1000;
      const accountAge = Math.floor(Math.random() * 1800) + 30; // 30-1830 days
      
      // Detect bot using advanced algorithm
      const botDetection = detectBot({
        followers,
        accountAge,
        username,
        verified,
      });
      
      // Determine if account is bot based on score (>50 = likely bot)
      const isBot = botDetection.score > 50;

      await storage.createAccount({
        username,
        displayName: arabicNames[nameIndex],
        avatar: `https://i.pravatar.cc/150?img=${(timestamp + i) % 70}`,
        verified,
        isBot,
        botScore: botDetection.score,
        city: cities[cityIndex],
        followers,
        accountAge,
        trendId,
      });
    }
  } catch (error) {
    console.error(`❌ Error generating simulated accounts for ${hashtag}:`, error);
    throw error; // Re-throw to see stack trace
  }
}
