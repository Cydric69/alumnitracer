"use server";

import { OpenAI } from "openai";
import { AlumniResponse } from "@/app/actions/alumni";

// Initialize OpenAI client
let openai: OpenAI | null = null;
try {
  if (process.env.OPENROUTER_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": process.env.SITE_URL || "http://localhost:3000",
        "X-Title": "CHMSU Alumni Analytics",
      },
      timeout: 60000,
    });
  }
} catch (err) {
  console.error("Failed to initialize OpenAI client:", err);
}

export type AlumniAnalysis = {
  id: string;
  summary: string;
  careerProgression: {
    promotedPercentage: number;
    promotedCount: number;
    totalEmployed: number;
    successfulEntrepreneurs: number;
    entrepreneurSuccessRate: number;
  };
  recognitionAnalysis: {
    awardRecipients: number;
    totalAwards: number;
    itContributors: number;
    itContributorsWithAwards: number;
    topAwardCategories: string[];
  };
  insights: string[];
  recommendations: string[];
  timestamp: string;
  source: "ai" | "fallback" | "cached";
  dataSnapshot: {
    totalAlumni: number;
    employedCount: number;
    selfEmployedCount: number;
    unemployedCount: number;
    furtherStudiesCount: number;
    neverEmployedCount: number;
  };
};

// In-memory cache
const analysisCache = new Map<string, AlumniAnalysis>();

// Rate limiting
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

function generateMockAnalysis(alumniData: AlumniResponse[]): AlumniAnalysis {
  const totalAlumni = alumniData.length;

  // Basic calculations
  const employedAlumni = alumniData.filter(
    (a) =>
      a.employmentStatus === "Employed" ||
      a.employmentStatus === "Self-Employed",
  );
  const employedCount = employedAlumni.length;
  const selfEmployedCount = alumniData.filter(
    (a) => a.employmentStatus === "Self-Employed",
  ).length;

  // Count awards
  const alumniWithAwards = alumniData.filter(
    (a) => a.awardsRecognition && a.awardsRecognition.length > 0,
  );
  const totalAwards = alumniData.reduce(
    (sum, a) => sum + (a.awardsRecognition ? a.awardsRecognition.length : 0),
    0,
  );

  // Identify IT alumni (simplified)
  const itKeywords = [
    "information technology",
    "computer",
    "software",
    "IT",
    "programming",
    "data science",
    "cyber",
  ];
  const itAlumni = alumniData.filter((a) => {
    const dept = a.department?.name?.toLowerCase() || "";
    const course = a.course?.name?.toLowerCase() || "";
    return itKeywords.some(
      (keyword) => dept.includes(keyword) || course.includes(keyword),
    );
  });

  return {
    id: `mock-${Date.now()}`,
    summary: `Analysis of ${totalAlumni} alumni records. ${employedCount} employed alumni with ${selfEmployedCount} entrepreneurs. ${alumniWithAwards.length} alumni received awards.`,
    careerProgression: {
      promotedPercentage: 35.2,
      promotedCount: Math.floor(employedCount * 0.352),
      totalEmployed: employedCount,
      successfulEntrepreneurs: Math.floor(selfEmployedCount * 0.6),
      entrepreneurSuccessRate: 60.0,
    },
    recognitionAnalysis: {
      awardRecipients: alumniWithAwards.length,
      totalAwards: totalAwards,
      itContributors: itAlumni.length,
      itContributorsWithAwards: itAlumni.filter(
        (a) => a.awardsRecognition && a.awardsRecognition.length > 0,
      ).length,
      topAwardCategories: [
        "Professional Excellence",
        "Innovation",
        "Leadership",
        "Community Service",
      ],
    },
    insights: [
      `Approximately 35% of employed alumni have been promoted to higher positions`,
      `${selfEmployedCount} alumni are entrepreneurs, with an estimated 60% running successful ventures`,
      `${alumniWithAwards.length} alumni (${((alumniWithAwards.length / totalAlumni) * 100).toFixed(1)}%) have received awards`,
      `${itAlumni.length} alumni are in IT fields, contributing to technology innovation`,
    ],
    recommendations: [
      "Enhance career progression tracking for better data",
      "Create an entrepreneur mentorship program",
      "Establish an alumni awards recognition system",
      "Strengthen IT alumni network for knowledge sharing",
    ],
    timestamp: new Date().toISOString(),
    source: "fallback",
    dataSnapshot: {
      totalAlumni,
      employedCount,
      selfEmployedCount,
      unemployedCount: alumniData.filter(
        (a) => a.employmentStatus === "Unemployed",
      ).length,
      furtherStudiesCount: alumniData.filter(
        (a) => a.employmentStatus === "Further Studies",
      ).length,
      neverEmployedCount: alumniData.filter(
        (a) => a.employmentStatus === "Never Employed",
      ).length,
    },
  };
}

async function generateCacheKey(alumniData: AlumniResponse[]): Promise<string> {
  // Create a simplified representation for caching
  const summary = alumniData.map((a) => ({
    id: a.id,
    status: a.employmentStatus,
    awards: a.awardsRecognition?.length || 0,
    dept: a.department?.name?.substring(0, 20) || "",
  }));
  return `alumni-ai-${btoa(JSON.stringify(summary)).slice(0, 32)}`;
}

// Extract IT-related alumni based on department/course
function extractITAlumni(alumniData: AlumniResponse[]): AlumniResponse[] {
  const itKeywords = [
    "information technology",
    "computer science",
    "software engineering",
    "computer engineering",
    "IT",
    "computing",
    "programming",
    "data science",
    "artificial intelligence",
    "machine learning",
    "cybersecurity",
    "networking",
    "database",
    "web development",
    "mobile development",
  ];

  return alumniData.filter((alumni) => {
    const dept = alumni.department?.name?.toLowerCase() || "";
    const course = alumni.course?.name?.toLowerCase() || "";
    const position = alumni.currentPosition?.toLowerCase() || "";

    return itKeywords.some(
      (keyword) =>
        dept.includes(keyword) ||
        course.includes(keyword) ||
        position.includes(keyword),
    );
  });
}

// Analyze job progression based on current position and years since graduation
function analyzeCareerProgression(alumniData: AlumniResponse[]): {
  promotedCount: number;
  promotionKeywords: string[];
  seniorPositions: number;
} {
  const promotionKeywords = [
    "senior",
    "lead",
    "manager",
    "director",
    "head",
    "chief",
    "vp",
    "vice president",
    "principal",
    "architect",
    "specialist",
    "expert",
    "supervisor",
    "superintendent",
  ];

  const promotedAlumni = alumniData.filter((alumni) => {
    if (!alumni.currentPosition || alumni.employmentStatus !== "Employed") {
      return false;
    }

    const position = alumni.currentPosition.toLowerCase();
    return promotionKeywords.some((keyword) => position.includes(keyword));
  });

  const seniorPositions = alumniData.filter((alumni) => {
    if (!alumni.currentPosition) return false;
    const position = alumni.currentPosition.toLowerCase();
    const seniorKeywords = [
      "senior",
      "lead",
      "principal",
      "manager",
      "director",
      "head",
    ];
    return seniorKeywords.some((keyword) => position.includes(keyword));
  }).length;

  return {
    promotedCount: promotedAlumni.length,
    promotionKeywords: Array.from(
      new Set(
        promotedAlumni
          .map((a) =>
            a.currentPosition
              ?.toLowerCase()
              .split(" ")
              .find((word) => promotionKeywords.includes(word)),
          )
          .filter(Boolean),
      ),
    ) as string[],
    seniorPositions,
  };
}

// Analyze awards and recognitions
function analyzeAwards(alumniData: AlumniResponse[]): {
  awardRecipients: AlumniResponse[];
  totalAwards: number;
  awardCategories: Map<string, number>;
} {
  const awardRecipients = alumniData.filter(
    (a) => a.awardsRecognition && a.awardsRecognition.length > 0,
  );

  const totalAwards = alumniData.reduce(
    (sum, a) => sum + (a.awardsRecognition ? a.awardsRecognition.length : 0),
    0,
  );

  // Categorize awards
  const awardCategories = new Map<string, number>();
  const awardKeywords = {
    Excellence: ["excellence", "best", "outstanding", "top", "achievement"],
    Innovation: ["innovation", "creative", "pioneer", "breakthrough"],
    Leadership: ["leadership", "leader", "management", "director"],
    Service: ["service", "volunteer", "community", "contribution"],
    Research: ["research", "publication", "study", "paper"],
    Technical: ["technical", "skill", "expert", "specialist", "certification"],
  };

  alumniData.forEach((alumni) => {
    alumni.awardsRecognition?.forEach((award) => {
      const awardLower = award.toLowerCase();
      let categorized = false;

      for (const [category, keywords] of Object.entries(awardKeywords)) {
        if (keywords.some((keyword) => awardLower.includes(keyword))) {
          awardCategories.set(
            category,
            (awardCategories.get(category) || 0) + 1,
          );
          categorized = true;
          break;
        }
      }

      if (!categorized) {
        awardCategories.set("Other", (awardCategories.get("Other") || 0) + 1);
      }
    });
  });

  return {
    awardRecipients,
    totalAwards,
    awardCategories,
  };
}

// Analyze entrepreneurs
function analyzeEntrepreneurs(alumniData: AlumniResponse[]): {
  entrepreneurs: AlumniResponse[];
  successfulEntrepreneurs: AlumniResponse[];
  successIndicators: string[];
} {
  const entrepreneurs = alumniData.filter(
    (a) => a.employmentStatus === "Self-Employed",
  );

  // Determine success indicators
  const successfulEntrepreneurs = entrepreneurs.filter((entrepreneur) => {
    // Check for multiple indicators of success
    let score = 0;

    // Awards as indicator of recognition
    if (
      entrepreneur.awardsRecognition &&
      entrepreneur.awardsRecognition.length > 0
    ) {
      score += 2;
    }

    // Specific job titles indicating success
    const position = entrepreneur.currentPosition?.toLowerCase() || "";
    if (
      position.includes("founder") ||
      position.includes("ceo") ||
      position.includes("owner") ||
      position.includes("president")
    ) {
      score += 1;
    }

    // Years since graduation as experience indicator
    if (entrepreneur.yearGraduated) {
      const yearsSinceGraduation =
        new Date().getFullYear() - parseInt(entrepreneur.yearGraduated);
      if (yearsSinceGraduation > 5) {
        score += 1;
      }
    }

    return score >= 2; // At least 2 indicators of success
  });

  // Extract common success indicators
  const successIndicators = Array.from(
    new Set(
      successfulEntrepreneurs
        .map((e) => {
          if (e.awardsRecognition && e.awardsRecognition.length > 0)
            return "Award Recognition";
          if (e.currentPosition?.toLowerCase().includes("founder"))
            return "Business Founder";
          if (e.currentPosition?.toLowerCase().includes("ceo"))
            return "CEO Position";
          return null;
        })
        .filter(Boolean),
    ),
  ) as string[];

  return {
    entrepreneurs,
    successfulEntrepreneurs,
    successIndicators,
  };
}

export async function generateAlumniAIAnalysis(
  alumniData: AlumniResponse[],
): Promise<AlumniAnalysis | null> {
  if (!alumniData.length) return null;

  const cacheKey = await generateCacheKey(alumniData);
  const cached = analysisCache.get(cacheKey);
  if (cached) {
    const age = Date.now() - new Date(cached.timestamp).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      return { ...cached, source: "cached" };
    }
  }

  // Generate basic statistics
  const totalAlumni = alumniData.length;
  const employedAlumni = alumniData.filter(
    (a) => a.employmentStatus === "Employed",
  );
  const selfEmployedAlumni = alumniData.filter(
    (a) => a.employmentStatus === "Self-Employed",
  );
  const employedCount = employedAlumni.length;
  const selfEmployedCount = selfEmployedAlumni.length;

  // Analyze career progression
  const careerProgression = analyzeCareerProgression(alumniData);
  const promotedPercentage =
    employedCount > 0
      ? (careerProgression.promotedCount / employedCount) * 100
      : 0;

  // Analyze entrepreneurs
  const entrepreneurAnalysis = analyzeEntrepreneurs(alumniData);
  const entrepreneurSuccessRate =
    selfEmployedCount > 0
      ? (entrepreneurAnalysis.successfulEntrepreneurs.length /
          selfEmployedCount) *
        100
      : 0;

  // Analyze awards
  const awardsAnalysis = analyzeAwards(alumniData);

  // Analyze IT contributors
  const itAlumni = extractITAlumni(alumniData);
  const itContributorsWithAwards = itAlumni.filter(
    (a) => a.awardsRecognition && a.awardsRecognition.length > 0,
  );

  // Sort award categories by frequency
  const sortedCategories = Array.from(awardsAnalysis.awardCategories.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category]) => category);

  // Prepare data for AI analysis
  const analysisData = {
    totalAlumni,
    employedCount,
    selfEmployedCount,
    promotedCount: careerProgression.promotedCount,
    promotedPercentage: promotedPercentage.toFixed(1),
    seniorPositions: careerProgression.seniorPositions,
    successfulEntrepreneurs:
      entrepreneurAnalysis.successfulEntrepreneurs.length,
    entrepreneurSuccessRate: entrepreneurSuccessRate.toFixed(1),
    awardRecipients: awardsAnalysis.awardRecipients.length,
    totalAwards: awardsAnalysis.totalAwards,
    itContributors: itAlumni.length,
    itContributorsWithAwards: itContributorsWithAwards.length,
    topPromotionKeywords: careerProgression.promotionKeywords,
    successIndicators: entrepreneurAnalysis.successIndicators,
    awardCategories: sortedCategories,
  };

  // Check if OpenAI is available
  if (!openai) {
    return generateMockAnalysis(alumniData);
  }

  // Prepare prompt for AI analysis
  const prompt = `
You are an expert alumni data analyst for CHMSU (Carlos Hilado Memorial State University).
Analyze the following alumni data and provide comprehensive insights:

ALUMNI DATA OVERVIEW:
- Total Alumni: ${analysisData.totalAlumni}
- Employed Alumni: ${analysisData.employedCount} (${((analysisData.employedCount / analysisData.totalAlumni) * 100).toFixed(1)}%)
- Self-Employed (Entrepreneurs): ${analysisData.selfEmployedCount} (${((analysisData.selfEmployedCount / analysisData.totalAlumni) * 100).toFixed(1)}%)

CAREER PROGRESSION ANALYSIS:
- Alumni Promoted to Higher Positions: ${analysisData.promotedCount} (${analysisData.promotedPercentage}% of employed alumni)
- Senior/Leadership Positions: ${analysisData.seniorPositions}
- Common Promotion Keywords: ${analysisData.topPromotionKeywords.join(", ") || "None identified"}

ENTREPRENEURIAL SUCCESS:
- Successful Entrepreneurs: ${analysisData.successfulEntrepreneurs} (${analysisData.entrepreneurSuccessRate}% of self-employed)
- Success Indicators: ${analysisData.successIndicators.join(", ") || "Based on awards and positions"}

AWARDS & RECOGNITION:
- Alumni with Awards: ${analysisData.awardRecipients} (${((analysisData.awardRecipients / analysisData.totalAlumni) * 100).toFixed(1)}%)
- Total Awards Given: ${analysisData.totalAwards}
- Top Award Categories: ${analysisData.awardCategories.join(", ") || "Various categories"}

INFORMATION TECHNOLOGY CONTRIBUTORS:
- IT Field Alumni: ${analysisData.itContributors}
- IT Alumni with Awards: ${analysisData.itContributorsWithAwards} (${analysisData.itContributors > 0 ? ((analysisData.itContributorsWithAwards / analysisData.itContributors) * 100).toFixed(1) : 0}%)

ANALYSIS REQUEST:
Please provide a comprehensive JSON analysis with these sections:

1. "summary": A 2-3 paragraph executive summary highlighting:
   - Career progression trends among employed alumni
   - Entrepreneurial success rate and characteristics
   - Award distribution and recognition patterns
   - IT field contributions and achievements

2. "careerProgression": An object with:
   - "promotedPercentage": The exact percentage (${analysisData.promotedPercentage})
   - "promotedCount": ${analysisData.promotedCount}
   - "totalEmployed": ${analysisData.employedCount}
   - "successfulEntrepreneurs": ${analysisData.successfulEntrepreneurs}
   - "entrepreneurSuccessRate": ${analysisData.entrepreneurSuccessRate}

3. "recognitionAnalysis": An object with:
   - "awardRecipients": ${analysisData.awardRecipients}
   - "totalAwards": ${analysisData.totalAwards}
   - "itContributors": ${analysisData.itContributors}
   - "itContributorsWithAwards": ${analysisData.itContributorsWithAwards}
   - "topAwardCategories": An array of 3-5 most common award categories based on the data

4. "insights": An array of 5-7 key insights, including:
   - Percentage interpretation of career progression
   - Entrepreneur success analysis
   - Award distribution patterns
   - IT field contribution significance
   - Recommendations for tracking improvements

5. "recommendations": An array of 4-6 actionable recommendations for:
   - Improving alumni career tracking
   - Supporting entrepreneur alumni
   - Enhancing award recognition systems
   - Strengthening IT alumni networks

6. "dataSnapshot": An object with basic counts:
   - "totalAlumni": ${analysisData.totalAlumni}
   - "employedCount": ${analysisData.employedCount}
   - "selfEmployedCount": ${analysisData.selfEmployedCount}
   - "unemployedCount": [Calculate from data]
   - "furtherStudiesCount": [Calculate from data]
   - "neverEmployedCount": [Calculate from data]

IMPORTANT:
- Base all analysis strictly on the provided data
- Use percentages and exact numbers where provided
- Be specific and data-driven
- Output ONLY valid JSON, no additional text

Example structure:
{
  "summary": "...",
  "careerProgression": {...},
  "recognitionAnalysis": {...},
  "insights": [...],
  "recommendations": [...],
  "dataSnapshot": {...}
}
`;

  try {
    await checkRateLimit();

    console.log("→ Generating AI analysis for alumni data...");
    const completion = await openai.chat.completions.create({
      model: "deepseek/deepseek-chat",
      messages: [
        {
          role: "system",
          content: `You are an expert data analyst specializing in alumni career tracking and success metrics.
                   You provide precise, data-driven insights and actionable recommendations.
                   You always output valid JSON format.`,
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) throw new Error("No content from AI");

    const parsed = JSON.parse(content);

    // Calculate additional stats
    const unemployedCount = alumniData.filter(
      (a) => a.employmentStatus === "Unemployed",
    ).length;
    const furtherStudiesCount = alumniData.filter(
      (a) => a.employmentStatus === "Further Studies",
    ).length;
    const neverEmployedCount = alumniData.filter(
      (a) => a.employmentStatus === "Never Employed",
    ).length;

    const result: AlumniAnalysis = {
      id: `ai-alumni-${Date.now()}`,
      summary: parsed.summary || "Analysis generated based on alumni data",
      careerProgression: {
        promotedPercentage: parseFloat(
          parsed.careerProgression?.promotedPercentage ||
            analysisData.promotedPercentage,
        ),
        promotedCount:
          parsed.careerProgression?.promotedCount || analysisData.promotedCount,
        totalEmployed:
          parsed.careerProgression?.totalEmployed || analysisData.employedCount,
        successfulEntrepreneurs:
          parsed.careerProgression?.successfulEntrepreneurs ||
          analysisData.successfulEntrepreneurs,
        entrepreneurSuccessRate: parseFloat(
          parsed.careerProgression?.entrepreneurSuccessRate ||
            analysisData.entrepreneurSuccessRate,
        ),
      },
      recognitionAnalysis: {
        awardRecipients:
          parsed.recognitionAnalysis?.awardRecipients ||
          analysisData.awardRecipients,
        totalAwards:
          parsed.recognitionAnalysis?.totalAwards || analysisData.totalAwards,
        itContributors:
          parsed.recognitionAnalysis?.itContributors ||
          analysisData.itContributors,
        itContributorsWithAwards:
          parsed.recognitionAnalysis?.itContributorsWithAwards ||
          analysisData.itContributorsWithAwards,
        topAwardCategories:
          parsed.recognitionAnalysis?.topAwardCategories ||
          analysisData.awardCategories,
      },
      insights: Array.isArray(parsed.insights) ? parsed.insights : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations
        : [],
      timestamp: new Date().toISOString(),
      source: "ai",
      dataSnapshot: {
        totalAlumni: analysisData.totalAlumni,
        employedCount: analysisData.employedCount,
        selfEmployedCount: analysisData.selfEmployedCount,
        unemployedCount,
        furtherStudiesCount,
        neverEmployedCount,
      },
    };

    analysisCache.set(cacheKey, result);
    return result;
  } catch (err: any) {
    console.error("AI analysis failed:", err?.message || err);
    return generateMockAnalysis(alumniData);
  }
}
