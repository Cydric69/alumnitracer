"use server";

import { OpenAI } from "openai";

// Initialize OpenAI client only if API key exists
let openai: OpenAI | null = null;
try {
  if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "CHMSU Alumni Feedback System",
      },
      timeout: 60000, // increased timeout – R1 can be slower
    });
  }
} catch (err) {
  console.error("Failed to initialize OpenAI client:", err);
}

export type AIAnalysis = {
  id: string;
  summary: string;
  detailedAnalysis: string;
  keyFindings: string[];
  improvementAreas: string[];
  recommendations: string[];
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  sentimentScore: number;
  timestamp: string;
  responseCount: number;
  source: "ai" | "fallback" | "cached";
};

export type FeedbackForAnalysis = {
  q1Rating?: number;
  q2Rating?: number;
  q3Rating?: number;
  q4Values?: string[];
  q5Skills?: string[];
  q6LikeMost?: string;
  q7NeedsImprovement?: string;
  q8Suggestions?: string;
  q9WouldEnroll?: "Yes" | "No";
  q10WhyReason?: string;
};

// In-memory cache
const analysisCache = new Map<string, AIAnalysis>();

// Rate limiting (keep conservative – free tier is strict)
const requestHistory: number[] = [];
const MAX_REQUESTS_PER_MINUTE = 8;
const REQUEST_WINDOW = 60 * 1000;

async function checkRateLimit(): Promise<void> {
  const now = Date.now();
  const windowStart = now - REQUEST_WINDOW;

  while (requestHistory.length > 0 && requestHistory[0] < windowStart) {
    requestHistory.shift();
  }

  if (requestHistory.length >= MAX_REQUESTS_PER_MINUTE) {
    const oldest = requestHistory[0];
    const wait = REQUEST_WINDOW - (now - oldest);
    console.log(`Rate limit → waiting ${Math.ceil(wait / 1000)}s`);
    await new Promise((r) => setTimeout(r, wait + 200));
  }

  requestHistory.push(now);
}

function generateMockAnalysis(feedbacks: FeedbackForAnalysis[]): AIAnalysis {
  const count = feedbacks.length;
  const avg = (a: number, b: number, c: number) => ((a + b + c) / 3).toFixed(1);
  const avgQ1 = count
    ? feedbacks.reduce((s, f) => s + (f.q1Rating || 0), 0) / count
    : 0;
  const avgQ2 = count
    ? feedbacks.reduce((s, f) => s + (f.q2Rating || 0), 0) / count
    : 0;
  const avgQ3 = count
    ? feedbacks.reduce((s, f) => s + (f.q3Rating || 0), 0) / count
    : 0;
  const yes = feedbacks.filter((f) => f.q9WouldEnroll === "Yes").length;
  const recRate = count ? ((yes / count) * 100).toFixed(1) : "0.0";

  return {
    id: `mock-${Date.now()}`,
    summary: `Analyzed ${count} responses. Avg satisfaction: ${avg(avgQ1, avgQ2, avgQ3)}/5. ${recRate}% recommend.`,
    detailedAnalysis: `Mock analysis (AI unavailable). Job search prep lowest at ${avgQ1.toFixed(1)}/5.`,
    keyFindings: [
      `Responses: ${count}`,
      `Recommend: ${recRate}%`,
      `Avg satisfaction: ${avg(avgQ1, avgQ2, avgQ3)}/5`,
    ],
    improvementAreas: ["Job search preparation", "Check Q7 & Q8 manually"],
    recommendations: ["Add OpenRouter credits", "Review raw text responses"],
    sentiment: avgQ1 >= 3 && avgQ2 >= 3 && avgQ3 >= 3 ? "positive" : "mixed",
    sentimentScore: count ? (avgQ1 + avgQ2 + avgQ3) / 15 : 0.5,
    timestamp: new Date().toISOString(),
    responseCount: count,
    source: "fallback",
  };
}

export async function generateAIAnalysis(
  feedbacks: FeedbackForAnalysis[],
): Promise<AIAnalysis | null> {
  if (!feedbacks.length) return null;

  const cacheKey = await generateCacheKey(feedbacks);
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - new Date(cached.timestamp).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      return { ...cached, source: "cached" };
    }
  }

  if (feedbacks.length <= 3) {
    return generateMockAnalysis(feedbacks);
  }

  if (!openai) {
    return generateMockAnalysis(feedbacks);
  }

  try {
    await checkRateLimit();
  } catch {
    return generateMockAnalysis(feedbacks);
  }

  // Helper function to analyze essay responses and extract themes
  const analyzeEssayResponses = (responses: string[]): string => {
    if (responses.length === 0) return "No responses provided.";

    // Group similar responses and identify common themes
    const themes: Record<string, number> = {};
    const commonWords = new Set([
      "the",
      "and",
      "for",
      "that",
      "this",
      "with",
      "have",
      "from",
      "they",
      "what",
      "about",
      "were",
      "when",
      "their",
      "there",
      "would",
      "could",
      "should",
      "very",
      "much",
      "some",
      "more",
      "most",
      "like",
      "just",
      "also",
      "well",
      "good",
      "need",
      "would",
      "can",
      "will",
      "may",
      "might",
      "must",
      "shall",
      "should",
      "could",
      "make",
      "take",
      "give",
      "find",
      "help",
      "work",
      "life",
      "university",
      "school",
      "college",
      "student",
      "teacher",
      "faculty",
      "course",
      "class",
      "subject",
    ]);

    responses.forEach((response) => {
      const words = response
        .toLowerCase()
        .replace(/[^\w\s]/g, " ")
        .split(/\s+/)
        .filter((word) => word.length > 4 && !commonWords.has(word))
        .slice(0, 10); // Take first 10 meaningful words

      words.forEach((word) => {
        themes[word] = (themes[word] || 0) + 1;
      });
    });

    // Sort by frequency and take top 5-7 themes
    const topThemes = Object.entries(themes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 7)
      .map(([theme, count]) => `${theme} (${count})`)
      .join(", ");

    return (
      topThemes || "Various individual responses, no strong common themes."
    );
  };

  // Helper to extract sentiment from essay responses
  const analyzeEssaySentiment = (
    responses: string[],
  ): { sentiment: string; examples: string[] } => {
    if (responses.length === 0) return { sentiment: "neutral", examples: [] };

    const positiveKeywords = [
      "good",
      "great",
      "excellent",
      "amazing",
      "wonderful",
      "helpful",
      "supportive",
      "friendly",
      "knowledgeable",
      "professional",
      "valuable",
      "useful",
      "enjoyable",
    ];
    const negativeKeywords = [
      "bad",
      "poor",
      "terrible",
      "awful",
      "difficult",
      "hard",
      "problem",
      "issue",
      "lack",
      "need",
      "improve",
      "better",
      "expensive",
      "slow",
    ];

    let positiveCount = 0;
    let negativeCount = 0;
    const examples: string[] = [];

    responses.slice(0, 5).forEach((response, idx) => {
      const lowerResponse = response.toLowerCase();
      const positiveMatches = positiveKeywords.filter((keyword) =>
        lowerResponse.includes(keyword),
      ).length;
      const negativeMatches = negativeKeywords.filter((keyword) =>
        lowerResponse.includes(keyword),
      ).length;

      if (positiveMatches > negativeMatches) positiveCount++;
      if (negativeMatches > positiveMatches) negativeCount++;

      // Take a short snippet as example
      if (response.length > 50) {
        examples.push(`"${response.substring(0, 100)}..."`);
      }
    });

    if (positiveCount > negativeCount * 2)
      return { sentiment: "positive", examples };
    if (negativeCount > positiveCount * 2)
      return { sentiment: "negative", examples };
    if (positiveCount > 0 && negativeCount > 0)
      return { sentiment: "mixed", examples };
    return { sentiment: "neutral", examples };
  };

  const count = feedbacks.length;
  const avgQ1 = count
    ? feedbacks.reduce((s, f) => s + (f.q1Rating || 0), 0) / count
    : 0;
  const avgQ2 = count
    ? feedbacks.reduce((s, f) => s + (f.q2Rating || 0), 0) / count
    : 0;
  const avgQ3 = count
    ? feedbacks.reduce((s, f) => s + (f.q3Rating || 0), 0) / count
    : 0;
  const yes = feedbacks.filter((f) => f.q9WouldEnroll === "Yes").length;
  const no = count - yes;
  const recRate = ((yes / count) * 100).toFixed(1);

  const likes = feedbacks
    .filter((f) => f.q6LikeMost?.trim())
    .map((f) => f.q6LikeMost!.trim());
  const needs = feedbacks
    .filter((f) => f.q7NeedsImprovement?.trim())
    .map((f) => f.q7NeedsImprovement!.trim());
  const sugg = feedbacks
    .filter((f) => f.q8Suggestions?.trim())
    .map((f) => f.q8Suggestions!.trim());
  const reasons = feedbacks
    .filter((f) => f.q10WhyReason?.trim())
    .map((f) => f.q10WhyReason!.trim());

  // Analyze essay responses
  const likeThemes = analyzeEssayResponses(likes);
  const needThemes = analyzeEssayResponses(needs);
  const suggestionThemes = analyzeEssayResponses(sugg);
  const reasonThemes = analyzeEssayResponses(reasons);

  const likeSentiment = analyzeEssaySentiment(likes);
  const needSentiment = analyzeEssaySentiment(needs);

  const valCount: Record<string, number> = {};
  const skCount: Record<string, number> = {};
  feedbacks.forEach((f) => {
    f.q4Values?.forEach((v) => {
      if (v.trim()) valCount[v] = (valCount[v] || 0) + 1;
    });
    f.q5Skills?.forEach((s) => {
      if (s.trim()) skCount[s] = (skCount[s] || 0) + 1;
    });
  });

  const topValues = Object.entries(valCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([v, c]) => `${v} (${c} alumni)`);
  const topSkills = Object.entries(skCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s, c]) => `${s} (${c} alumni)`);

  // Get sample quotes from essay responses
  const getSampleQuotes = (
    responses: string[],
    count: number = 3,
  ): string[] => {
    return responses
      .filter((r) => r.length > 20)
      .slice(0, count)
      .map((r) => (r.length > 80 ? `"${r.substring(0, 80)}..."` : `"${r}"`));
  };

  const likeQuotes = getSampleQuotes(likes, 2);
  const needQuotes = getSampleQuotes(needs, 2);
  const suggestionQuotes = getSampleQuotes(sugg, 2);
  const reasonQuotes = getSampleQuotes(reasons, 2);

  const prompt = `
You are an expert education analyst for CHMSU (Carlos Hilado Memorial State University).
Analyze this alumni feedback data and provide comprehensive insights:

OVERVIEW:
- Total responses: ${count}
- Average ratings (1–5 scale where 1=Strongly Disagree, 5=Strongly Agree):
  • Q1: Job Search Preparation: ${avgQ1.toFixed(1)}/5
  • Q2: Career Preparation: ${avgQ2.toFixed(1)}/5
  • Q3: Other Jobs Preparation: ${avgQ3.toFixed(1)}/5
- Would recommend CHMSU: ${yes} Yes, ${no} No (${recRate}% recommendation rate)

VALUES & SKILLS DEVELOPED:
- Top values: ${topValues.length ? topValues.join(", ") : "None reported"}
- Top skills: ${topSkills.length ? topSkills.join(", ") : "None reported"}

ESSAY RESPONSES ANALYSIS:

Q6: "What did you LIKE MOST about your Alma Mater?" (${likes.length} responses)
- Common themes: ${likeThemes}
- Sentiment analysis: ${likeSentiment.sentiment}
- Sample feedback: ${likeQuotes.length > 0 ? likeQuotes.join(" | ") : "No quotes available"}

Q7: "What did you NOT LIKE MOST about your Alma Mater that needs to be IMPROVED?" (${needs.length} responses)
- Common themes: ${needThemes}
- Sentiment analysis: ${needSentiment.sentiment}
- Sample feedback: ${needQuotes.length > 0 ? needQuotes.join(" | ") : "No quotes available"}

Q8: "Any SUGGESTION(S) for CHMSU to be better?" (${sugg.length} responses)
- Common themes: ${suggestionThemes}
- Sample suggestions: ${suggestionQuotes.length > 0 ? suggestionQuotes.join(" | ") : "No quotes available"}

Q10: "Why? (Reason for recommendation)" (${reasons.length} responses)
- Common themes: ${reasonThemes}
- Sample reasons: ${reasonQuotes.length > 0 ? reasonQuotes.join(" | ") : "No quotes available"}

ANALYSIS REQUEST:
Please provide a comprehensive JSON analysis with these sections:

1. "summary": A 2–3 sentence executive summary highlighting key metrics and overall sentiment.

2. "detailedAnalysis": A 4–5 paragraph detailed analysis that:
   - Compares the three rating questions (Q1-Q3) and identifies strengths/weaknesses
   - Discusses the values and skills developed (Q4-Q5) and their importance
   - Analyzes the essay responses (Q6-Q8, Q10) by:
     * Identifying recurring themes, emotions, and concerns
     * Extracting actionable insights from the qualitative feedback
     * Connecting essay responses to the quantitative ratings
   - Explains the recommendation rate (Q9) in context of the overall feedback
   - Provides insights about alumni satisfaction and institutional impact

3. "keyFindings": 5-7 bullet points with the most important discoveries.

4. "improvementAreas": 4-6 specific areas needing attention, prioritized by frequency in essay responses.

5. "recommendations": 5-7 actionable recommendations for CHMSU administration, based on both quantitative and qualitative data.

6. "sentiment": Choose from "positive", "negative", "neutral", or "mixed". Consider both ratings and essay tone.

7. "sentimentScore": A number from 0.0 to 1.0 representing overall sentiment (0=negative, 0.5=neutral, 1=positive).

IMPORTANT INSTRUCTIONS:
- Base recommendations directly on alumni feedback, especially essay responses
- Connect quantitative ratings to qualitative comments
- Prioritize issues mentioned frequently in essay responses
- Be specific and actionable in recommendations
- Maintain professional, data-driven tone
- Output ONLY valid JSON, no additional text

Example structure:
{
  "summary": "...",
  "detailedAnalysis": "...",
  "keyFindings": ["...", "..."],
  "improvementAreas": ["...", "..."],
  "recommendations": ["...", "..."],
  "sentiment": "positive",
  "sentimentScore": 0.85
}
`;

  try {
    console.log("→ DeepSeek R1 request...");
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert education analyst specializing in alumni feedback analysis.
                   You excel at extracting insights from both quantitative ratings and qualitative essay responses.
                   You provide specific, actionable recommendations based on data.
                   Output only valid JSON.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3, // Slightly higher for better essay analysis
      max_tokens: 1800, // Increased for more detailed analysis
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content");

    const parsed = JSON.parse(content);

    const result: AIAnalysis = {
      id: `ai-${Date.now()}`,
      summary: parsed.summary || "No summary available",
      detailedAnalysis:
        parsed.detailedAnalysis || "No detailed analysis available",
      keyFindings: Array.isArray(parsed.keyFindings) ? parsed.keyFindings : [],
      improvementAreas: Array.isArray(parsed.improvementAreas)
        ? parsed.improvementAreas
        : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      sentiment: ["positive", "negative", "neutral", "mixed"].includes(
        parsed.sentiment,
      )
        ? (parsed.sentiment as "positive" | "negative" | "neutral" | "mixed")
        : "neutral",
      sentimentScore: Math.max(
        0,
        Math.min(1, Number(parsed.sentimentScore) || 0.5),
      ),
      timestamp: new Date().toISOString(),
      responseCount: count,
      source: "ai",
    };

    analysisCache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error("DeepSeek R1 failed:", err?.message || err);
    return generateMockAnalysis(feedbacks);
  }
}

export async function generateCacheKey(feedbacks: any[]): Promise<string> {
  const data = feedbacks.map((f) => ({
    q1: f.q1Rating || 0,
    q2: f.q2Rating || 0,
    q3: f.q3Rating || 0,
    q4: f.q4Values || [],
    q5: f.q5Skills || [],
    q6: f.q6LikeMost || "",
    q7: f.q7NeedsImprovement || "",
    q8: f.q8Suggestions || "",
    q9: f.q9WouldEnroll || "",
    q10: f.q10WhyReason || "",
  }));
  return `ai-r1-${btoa(JSON.stringify(data)).slice(0, 32)}`;
}
