/**
 * Advanced Bot Detection Algorithms for Saudi Twitter/X Accounts
 * 
 * Analyzes multiple factors to determine the likelihood an account is a bot:
 * - Follower ratio patterns
 * - Account age
 * - Posting frequency (simulated)
 * - Username patterns
 */

export interface BotDetectionFactors {
  followers: number;
  accountAge: number; // Days since creation
  username: string;
  verified: boolean;
}

export interface BotDetectionResult {
  score: number; // 0-100 (0=definitely human, 100=definitely bot)
  factors: {
    followerRatio: number; // 0-30 points
    accountAge: number; // 0-25 points
    usernamePattern: number; // 0-20 points
    verificationBonus: number; // -25 points if verified
    randomBehavior: number; // 0-25 points
  };
}

/**
 * Analyzes follower count patterns to detect suspicious accounts
 * Very low or very high follower counts can indicate bots
 */
function analyzeFollowerPattern(followers: number): number {
  // Bots often have either very few followers (new spam bots)
  // or suspiciously round/high numbers (purchased followers)
  
  if (followers < 10) {
    return 25; // Very suspicious - brand new bot accounts
  } else if (followers < 50) {
    return 15; // Moderately suspicious
  } else if (followers < 200) {
    return 5; // Slightly suspicious
  } else if (followers > 100000) {
    // Check for suspiciously round numbers (bot farms)
    const isRound = followers % 10000 === 0 || followers % 5000 === 0;
    return isRound ? 20 : 5;
  } else if (followers > 50000) {
    return 3; // High engagement, less likely bot
  }
  
  return 0; // Normal follower count
}

/**
 * Analyzes account age to detect newly created bot accounts
 */
function analyzeAccountAge(ageInDays: number): number {
  if (ageInDays < 7) {
    return 25; // Brand new account - very suspicious
  } else if (ageInDays < 30) {
    return 20; // Less than a month old - suspicious
  } else if (ageInDays < 90) {
    return 10; // Less than 3 months - moderately suspicious
  } else if (ageInDays < 180) {
    return 5; // Less than 6 months - slightly suspicious
  }
  
  return 0; // Established account
}

/**
 * Analyzes username patterns for bot characteristics
 */
function analyzeUsernamePattern(username: string): number {
  let score = 0;
  
  // Pattern 1: Ends with multiple digits (e.g., user12345)
  const endsWithDigitsMatch = username.match(/\d{3,}$/);
  if (endsWithDigitsMatch) {
    score += 15;
  }
  
  // Pattern 2: Contains random number sequences
  const hasRandomNumbers = /\d{4,}/.test(username);
  if (hasRandomNumbers) {
    score += 10;
  }
  
  // Pattern 3: Very short username (often taken by bots)
  if (username.length < 5) {
    score += 8;
  }
  
  // Pattern 4: Contains common bot keywords
  const botKeywords = ['bot', 'auto', 'spam', 'promo', 'official', '_'];
  const containsBotKeyword = botKeywords.some(keyword => 
    username.toLowerCase().includes(keyword)
  );
  if (containsBotKeyword) {
    score += 12;
  }
  
  return Math.min(score, 20); // Cap at 20 points
}

/**
 * Analyzes posting frequency based on follower-to-age ratio
 * Accounts with very high followers for their age may indicate bot farms
 */
function analyzePostingBehavior(followers: number, accountAge: number): number {
  // Calculate followers-per-day ratio
  const followersPerDay = followers / Math.max(accountAge, 1);
  
  // Suspicious patterns:
  // - Very high follower growth rate (>1000/day) = likely bought followers
  // - Moderate-high growth (>500/day) = potentially suspicious
  // - Normal growth (<500/day) = likely organic
  
  if (followersPerDay > 1000) {
    return 25; // Extremely high growth - very suspicious
  } else if (followersPerDay > 500) {
    return 15; // High growth - suspicious
  } else if (followersPerDay > 200) {
    return 8; // Moderate growth - slightly suspicious
  }
  
  return 0; // Normal organic growth
}

/**
 * Main bot detection function
 * Combines multiple factors to calculate overall bot probability
 */
export function detectBot(factors: BotDetectionFactors): BotDetectionResult {
  const followerScore = analyzeFollowerPattern(factors.followers);
  const ageScore = analyzeAccountAge(factors.accountAge);
  const usernameScore = analyzeUsernamePattern(factors.username);
  const postingScore = analyzePostingBehavior(factors.followers, factors.accountAge);
  
  // Verified accounts get a significant bonus (negative score)
  const verificationBonus = factors.verified ? -25 : 0;
  
  // Calculate total score (0-100)
  const totalScore = Math.max(0, Math.min(100,
    followerScore + ageScore + usernameScore + postingScore + verificationBonus
  ));
  
  return {
    score: totalScore,
    factors: {
      followerRatio: followerScore,
      accountAge: ageScore,
      usernamePattern: usernameScore,
      verificationBonus: verificationBonus,
      randomBehavior: postingScore,
    },
  };
}

/**
 * Helper function to categorize bot score into risk levels
 */
export function getBotRiskLevel(score: number): {
  level: "low" | "medium" | "high" | "very_high";
  label: string;
  labelAr: string;
} {
  if (score >= 75) {
    return { level: "very_high", label: "Very High Risk", labelAr: "خطر عالي جداً" };
  } else if (score >= 50) {
    return { level: "high", label: "High Risk", labelAr: "خطر عالي" };
  } else if (score >= 25) {
    return { level: "medium", label: "Medium Risk", labelAr: "خطر متوسط" };
  } else {
    return { level: "low", label: "Low Risk", labelAr: "خطر منخفض" };
  }
}
