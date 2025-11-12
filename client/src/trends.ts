// server/trends.ts
import fetch from "node-fetch";
import * as cheerio from "cheerio";

let cache: { data: string[]; ts: number } | null = null;
const TTL_MS = 60_000;

export async function getSaudiTrends(): Promise<string[]> {
  const now = Date.now();
  if (cache && now - cache.ts < TTL_MS) return cache.data;

  const res = await fetch("https://trends24.in/saudi-arabia/");
  const html = await res.text();
  const $ = cheerio.load(html);
  const trends: string[] = [];
  $(".trend-card__list li a").each((_, el) => {
    const t = $(el).text().trim();
    if (t) trends.push(t.startsWith("#") ? t : `#${t}`);
  });

  if (trends.length) cache = { data: trends.slice(0, 25), ts: now };
  return cache?.data ?? [];
}
