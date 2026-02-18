import OpenAI from "openai";

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || "your-api-key-here";
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1";

// Initialize DeepSeek client
export const deepseekClient = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: DEEPSEEK_API_URL,
});

export async function generateDeepSeekAnalysis(
  prompt: string,
  context?: string,
): Promise<string> {
  try {
    // Prepare messages array with proper types
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are a feedback analysis expert for a university (CHMSU). Analyze alumni feedback to provide insightful, actionable recommendations. Focus on identifying patterns, themes, and specific areas for improvement.`,
      },
    ];

    // Add context if provided
    if (context) {
      messages.push({
        role: "system",
        content: `Context: ${context}`,
      } as OpenAI.Chat.ChatCompletionMessageParam);
    }

    // Add user prompt
    messages.push({
      role: "user",
      content: prompt,
    } as OpenAI.Chat.ChatCompletionMessageParam);

    const response = await deepseekClient.chat.completions.create({
      model: "deepseek-chat", // Free model
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    return response.choices[0]?.message?.content || "No analysis generated";
  } catch (error) {
    console.error("DeepSeek API Error:", error);

    // Provide a fallback analysis if API fails
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error(
          "DeepSeek API key is invalid or missing. Please check your configuration.",
        );
      } else if (error.message.includes("rate limit")) {
        throw new Error("API rate limit exceeded. Please try again later.");
      }
    }

    throw new Error("Failed to generate AI analysis. Please try again.");
  }
}

// Specific analysis functions for different question types
export async function analyzeOpenEndedFeedback(
  questionText: string,
  feedbackResponses: string[],
  analyticsSummary?: any,
): Promise<string> {
  // If no responses, return empty analysis
  if (feedbackResponses.length === 0) {
    return "No feedback responses available for analysis.";
  }

  const prompt = `Analyze the following alumni feedback responses for this question:

**Question:** "${questionText}"

**Total responses:** ${feedbackResponses.length}
**Sample responses:**
${feedbackResponses
  .slice(0, 10)
  .map((r) => `- "${r}"`)
  .join("\n")}

${
  analyticsSummary
    ? `**Analytics Summary:**
   - Response rate: ${analyticsSummary.responseRate}%
   - Most common themes: ${analyticsSummary.mostCommonResponses
     ?.map((r: any) => r.answer)
     .join(", ")}`
    : ""
}

**Please provide analysis covering:**
1. Key themes and patterns identified
2. Sentiment analysis (positive/negative/neutral)
3. Specific actionable recommendations
4. Urgency level (high/medium/low)
5. Potential impact areas

Format the response in clear, structured paragraphs.`;

  return generateDeepSeekAnalysis(prompt);
}

export async function analyzeRatingData(
  questionText: string,
  averageRating: number,
  distribution: Record<string, number>,
  totalResponses: number,
): Promise<string> {
  const prompt = `Analyze the following rating data for this question:

**Question:** "${questionText}"

**Average Rating:** ${averageRating.toFixed(1)}/5
**Total Responses:** ${totalResponses}
**Rating Distribution:**
${Object.entries(distribution)
  .map(
    ([rating, count]) =>
      `  ${rating}/5: ${count} responses (${((count / totalResponses) * 100).toFixed(1)}%)`,
  )
  .join("\n")}

**Provide analysis covering:**
1. Overall satisfaction level
2. Distribution insights (are responses polarized or consistent?)
3. Strengths indicated by high ratings
4. Areas for improvement indicated by low ratings
5. Comparison to ideal benchmarks (4+ is good)
6. Recommendations based on the data`;

  return generateDeepSeekAnalysis(prompt);
}

export async function generateExecutiveSummary(
  allQuestionAnalytics: any[],
  totalResponses: number,
): Promise<string> {
  const prompt = `Generate an executive summary based on comprehensive alumni feedback analysis.

**Total Alumni Surveyed:** ${totalResponses}

**Key Questions Summary:**
${allQuestionAnalytics
  .map(
    (q) =>
      `**Q${q.questionNumber}:** ${q.questionText}
   - Response Rate: ${q.responseRate.toFixed(1)}%
   ${
     q.averageRating
       ? `- Average Rating: ${q.averageRating.toFixed(1)}/5`
       : `- Top Themes: ${q.mostCommonResponses
           ?.slice(0, 3)
           .map((r: any) => r.answer)
           .join(", ")}`
   }`,
  )
  .join("\n\n")}

**Please provide a comprehensive executive summary covering:**
1. Overall alumni satisfaction and engagement
2. Key strengths of the institution
3. Critical areas needing improvement
4. Strategic recommendations
5. Quick wins vs. long-term initiatives
6. Risk assessment and mitigation strategies

**Format for university leadership consumption.**`;

  return generateDeepSeekAnalysis(prompt);
}

// New function for batch analysis
export async function analyzeMultipleQuestions(
  questions: Array<{
    questionNumber: number;
    questionText: string;
    feedbackResponses: string[];
    analyticsSummary?: any;
  }>,
): Promise<Array<{ questionNumber: number; analysis: string }>> {
  const results = [];

  for (const question of questions) {
    try {
      let analysis: string;

      if (question.questionNumber <= 3) {
        // Rating questions
        if (
          question.analyticsSummary?.averageRating &&
          question.analyticsSummary?.distribution
        ) {
          analysis = await analyzeRatingData(
            question.questionText,
            question.analyticsSummary.averageRating,
            question.analyticsSummary.distribution,
            question.analyticsSummary.responseCount,
          );
        } else {
          analysis = "Insufficient data for rating analysis.";
        }
      } else {
        // Open-ended questions
        analysis = await analyzeOpenEndedFeedback(
          question.questionText,
          question.feedbackResponses,
          question.analyticsSummary,
        );
      }

      results.push({
        questionNumber: question.questionNumber,
        analysis,
      });

      // Add delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      console.error(
        `Error analyzing question ${question.questionNumber}:`,
        error,
      );
      results.push({
        questionNumber: question.questionNumber,
        analysis: "Failed to generate analysis. Please try again.",
      });
    }
  }

  return results;
}
