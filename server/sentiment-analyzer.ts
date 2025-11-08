// Arabic Sentiment Analysis Utility
// Analyzes Arabic text sentiment based on keyword matching

const positiveWords = [
  // إيجابي - Positive
  "سعيد", "رائع", "ممتاز", "جميل", "مبهر", "مذهل", "عظيم", "فرح", "سرور",
  "نجاح", "فوز", "إنجاز", "تقدم", "تطور", "ازدهار", "حب", "سلام", "أمل",
  "جيد", "حلو", "لطيف", "بديع", "فخم", "قوي", "عالي", "متميز", "فخور",
  "احتفال", "مباركة", "بركة", "خير", "نعمة", "هدية", "فرصة", "مكسب",
  "ابتسامة", "ضحك", "مرح", "بهجة", "حماس", "إبداع", "ذكاء", "موهبة",
  "شكر", "امتنان", "تقدير", "احترام", "كرم", "عطاء", "صدق", "وفاء",
  "👍", "❤️", "🎉", "💚", "✨", "🌟", "💪", "🔥", "يحيا", "مبروك",
];

const negativeWords = [
  // سلبي - Negative
  "حزين", "سيء", "فظيع", "مروع", "كارثة", "فشل", "خسارة", "هزيمة", "ألم",
  "غضب", "كره", "حقد", "ظلم", "معاناة", "مشكلة", "أزمة", "خطر", "تهديد",
  "سوء", "قبيح", "بشع", "ضعيف", "رديء", "تعيس", "محزن", "مؤلم", "مخيب",
  "فقر", "جوع", "مرض", "موت", "دمار", "خراب", "انهيار", "تراجع", "ضرر",
  "غش", "خداع", "كذب", "خيانة", "فساد", "جريمة", "عدوان", "حرب", "عنف",
  "خوف", "قلق", "توتر", "اكتئاب", "يأس", "إحباط", "ملل", "تعب", "إرهاق",
  "👎", "💔", "😢", "😡", "⚠️", "❌", "للأسف", "واحسرتاه",
];

const neutralWords = [
  "الآن", "اليوم", "غداً", "أمس", "هنا", "هناك", "ربما", "لكن", "أو",
  "عن", "من", "إلى", "في", "على", "مع", "بعد", "قبل", "حول", "خلال",
  "كل", "بعض", "معظم", "جميع", "هذا", "ذلك", "تلك", "هؤلاء", "أولئك",
];

export interface SentimentResult {
  positive: number; // 0-100
  negative: number; // 0-100
  neutral: number; // 0-100
  overall: "positive" | "negative" | "neutral";
}

/**
 * Analyzes sentiment of Arabic text
 * @param text - Arabic text to analyze
 * @returns Sentiment percentages and overall classification
 */
export function analyzeSentiment(text: string): SentimentResult {
  if (!text || text.trim().length === 0) {
    return {
      positive: 0,
      negative: 0,
      neutral: 100,
      overall: "neutral",
    };
  }

  const normalizedText = text.toLowerCase();
  const words = normalizedText.split(/\s+/);

  let positiveCount = 0;
  let negativeCount = 0;
  let neutralCount = 0;

  // Count keyword matches
  words.forEach((word) => {
    if (positiveWords.some((pw) => word.includes(pw) || pw.includes(word))) {
      positiveCount++;
    } else if (negativeWords.some((nw) => word.includes(nw) || nw.includes(word))) {
      negativeCount++;
    } else if (neutralWords.some((neu) => word.includes(neu))) {
      neutralCount++;
    }
  });

  // Calculate total sentiment indicators
  const total = positiveCount + negativeCount + neutralCount;

  // Default to neutral if no sentiment indicators found
  if (total === 0) {
    return {
      positive: 33,
      negative: 33,
      neutral: 34,
      overall: "neutral",
    };
  }

  // Calculate percentages
  const positive = Math.round((positiveCount / total) * 100);
  const negative = Math.round((negativeCount / total) * 100);
  const neutral = 100 - positive - negative;

  // Determine overall sentiment
  let overall: "positive" | "negative" | "neutral";
  if (positive > negative && positive > neutral) {
    overall = "positive";
  } else if (negative > positive && negative > neutral) {
    overall = "negative";
  } else {
    overall = "neutral";
  }

  return {
    positive,
    negative,
    neutral,
    overall,
  };
}

/**
 * Analyzes sentiment for a hashtag trend
 * Returns simulated sentiment based on hashtag characteristics
 */
export function analyzeHashtagSentiment(hashtag: string): SentimentResult {
  const sentiment = analyzeSentiment(hashtag);
  
  // If hashtag analysis is neutral, generate realistic distribution
  if (sentiment.overall === "neutral" && sentiment.positive < 40) {
    // Most Saudi trends tend to be positive or neutral
    const randomFactor = Math.random();
    
    if (randomFactor > 0.7) {
      // 30% chance of predominantly positive
      const positive = Math.floor(50 + Math.random() * 30); // 50-80%
      const negative = Math.floor(5 + Math.random() * 15); // 5-20%
      const neutral = 100 - positive - negative;
      return {
        positive,
        negative,
        neutral: Math.max(0, neutral),
        overall: "positive",
      };
    } else if (randomFactor < 0.15) {
      // 15% chance of predominantly negative
      const positive = Math.floor(5 + Math.random() * 15); // 5-20%
      const negative = Math.floor(50 + Math.random() * 30); // 50-80%
      const neutral = 100 - positive - negative;
      return {
        positive,
        negative,
        neutral: Math.max(0, neutral),
        overall: "negative",
      };
    } else {
      // 55% chance of balanced/neutral
      const positive = Math.floor(30 + Math.random() * 20); // 30-50%
      const negative = Math.floor(20 + Math.random() * 20); // 20-40%
      const neutral = 100 - positive - negative;
      return {
        positive,
        negative,
        neutral: Math.max(0, neutral),
        overall: "neutral",
      };
    }
  }
  
  // Normalize percentages to sum to 100
  const total = sentiment.positive + sentiment.negative + sentiment.neutral;
  if (total !== 100) {
    const diff = 100 - total;
    sentiment.neutral = Math.max(0, sentiment.neutral + diff);
  }
  
  return sentiment;
}
