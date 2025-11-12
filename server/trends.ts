import fetch from "node-fetch";
import * as cheerio from "cheerio";

export async function getSaudiTrends(): Promise<string[]> {
  const res = await fetch("https://trends24.in/saudi-arabia/");
  const html = await res.text();
  const $ = cheerio.load(html);
  const trends: string[] = [];

  $(".trend-card__list li a").each((_, el) => {
    const txt = $(el).text().trim();
    const tag = txt.startsWith("#") ? txt : `#${txt}`;
    trends.push(tag);
  });

  return trends;
}
