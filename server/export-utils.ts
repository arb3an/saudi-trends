import type { Trend, Account } from "@shared/schema";

/**
 * Convert trends data to CSV format
 */
export function trendsToCSV(trends: Trend[]): string {
  if (trends.length === 0) {
    return "No data available";
  }

  // CSV headers (Arabic)
  const headers = [
    "الهاشتاغ",
    "الترتيب",
    "عدد التغريدات",
    "السرعة",
    "إعادات التغريد",
    "الإعجابات",
    "التعليقات",
    "المشاعر الإيجابية (%)",
    "المشاعر السلبية (%)",
    "المشاعر المحايدة (%)",
    "آخر تحديث",
  ].join(",");

  // CSV rows
  const rows = trends.map((trend) => {
    return [
      `"${trend.hashtag}"`,
      trend.rank,
      trend.tweetCount,
      trend.velocity,
      trend.retweets,
      trend.likes,
      trend.comments,
      trend.sentimentPositive,
      trend.sentimentNegative,
      trend.sentimentNeutral,
      `"${trend.lastUpdated}"`,
    ].join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Convert accounts data to CSV format
 */
export function accountsToCSV(accounts: Account[]): string {
  if (accounts.length === 0) {
    return "No data available";
  }

  // CSV headers (Arabic)
  const headers = [
    "اسم المستخدم",
    "الاسم المعروض",
    "موثق",
    "المدينة",
    "المتابعون",
    "احتمالية البوت",
    "عمر الحساب (أيام)",
    "بوت",
  ].join(",");

  // CSV rows
  const rows = accounts.map((account) => {
    return [
      `"${account.username}"`,
      `"${account.displayName || ""}"`,
      account.verified ? "نعم" : "لا",
      `"${account.city || ""}"`,
      account.followers,
      account.botScore || 0,
      account.accountAge || 0,
      account.isBot ? "نعم" : "لا",
    ].join(",");
  });

  return [headers, ...rows].join("\n");
}

/**
 * Generate filename for export with timestamp
 */
export function generateExportFilename(
  type: "trends" | "accounts",
  format: "csv" | "json"
): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `saudi-trends-${type}-${timestamp}.${format}`;
}
