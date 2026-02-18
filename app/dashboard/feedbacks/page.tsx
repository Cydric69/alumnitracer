"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  Calendar,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Users,
  Target,
  Brain,
  Heart,
  FileText,
  Lightbulb,
  Star,
  ThumbsUp,
  ThumbsDown,
  Hash,
  Percent,
  LineChart,
  MessageSquare,
  CheckSquare,
  Sparkles,
  Loader2,
  Bot,
  Zap,
  Eye,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  getFeedbacks,
  getFeedbackStats,
  getFeedbackYears,
} from "../../actions/feedback.actions";
import {
  generateAIAnalysis,
  type AIAnalysis,
  type FeedbackForAnalysis,
  generateCacheKey as generateServerCacheKey,
} from "../../actions/analysis";
import type { IFeedback, FilterOption } from "@/types/feedback";

type TrendType = "up" | "down" | "stable";

type QuestionAnalytics = {
  questionNumber: number;
  questionText: string;
  responseCount: number;
  responseRate: number;
  mostCommonResponses: Array<{
    answer: string;
    count: number;
    percentage: number;
    trend?: TrendType;
  }>;
  averageRating?: number;
  distribution?: Record<string, number>;
  insights: string[];
};

interface AICache {
  [key: string]: {
    data: AIAnalysis;
    timestamp: number;
    feedbackCount: number;
    cacheKey: string;
  };
}

// Helper component for displaying response stats
const ResponseStatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: any;
  trend?: TrendType;
}) => (
  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-gray-700" />
        <span className="text-sm font-medium text-gray-900 font-inter">
          {title}
        </span>
      </div>
      {trend && (
        <Badge
          variant="outline"
          className={
            trend === "up"
              ? "bg-green-50 text-green-800 border-green-800"
              : trend === "down"
                ? "bg-red-50 text-red-600 border-red-600"
                : "bg-gray-50 text-gray-700 border-gray-700"
          }
        >
          {trend === "up" ? (
            <TrendingUp className="h-3 w-3 mr-1" />
          ) : trend === "down" ? (
            <TrendingDown className="h-3 w-3 mr-1" />
          ) : (
            <BarChart3 className="h-3 w-3 mr-1" />
          )}
          {trend}
        </Badge>
      )}
    </div>
    <div className="text-2xl font-bold text-green-800 font-inter">{value}</div>
    <p className="text-xs text-gray-600 mt-1 font-inter">{description}</p>
  </div>
);

// Component for essay response dialog - Updated to be reusable for each question
interface EssayResponseDialogProps {
  questionNumber: number;
  questionText: string;
  responses: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EssayResponseDialog = ({
  questionNumber,
  questionText,
  responses,
  isOpen,
  onOpenChange,
}: EssayResponseDialogProps) => {
  const [displayedResponses, setDisplayedResponses] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [cachedPages, setCachedPages] = useState<Record<number, string[]>>({});
  const responsesPerPage = 5;
  const dialogContentRef = useRef<HTMLDivElement>(null);

  // Load initial responses when dialog opens
  useEffect(() => {
    if (isOpen && responses.length > 0) {
      const initialPage = 1;
      if (!cachedPages[initialPage]) {
        const start = (initialPage - 1) * responsesPerPage;
        const end = start + responsesPerPage;
        const pageResponses = responses.slice(start, end);
        setCachedPages((prev) => ({ ...prev, [initialPage]: pageResponses }));
      }
      setDisplayedResponses(
        cachedPages[initialPage] || responses.slice(0, responsesPerPage),
      );
      setPage(initialPage);
    }
  }, [isOpen, responses]);

  const totalPages = Math.ceil(responses.length / responsesPerPage);

  const loadMoreResponses = useCallback(() => {
    if (isLoadingMore || page >= totalPages) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    // Check cache first
    if (cachedPages[nextPage]) {
      setDisplayedResponses((prev) => [...prev, ...cachedPages[nextPage]]);
      setPage(nextPage);
      setIsLoadingMore(false);
      return;
    }

    // Simulate loading delay
    setTimeout(() => {
      const start = (nextPage - 1) * responsesPerPage;
      const end = start + responsesPerPage;
      const pageResponses = responses.slice(start, end);

      // Cache the page
      setCachedPages((prev) => ({ ...prev, [nextPage]: pageResponses }));
      setDisplayedResponses((prev) => [...prev, ...pageResponses]);
      setPage(nextPage);
      setIsLoadingMore(false);
    }, 300);
  }, [page, totalPages, responses, cachedPages, isLoadingMore]);

  // Handle scroll for infinite loading
  const handleScroll = useCallback(() => {
    if (!dialogContentRef.current || isLoadingMore || page >= totalPages)
      return;

    const { scrollTop, scrollHeight, clientHeight } = dialogContentRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;

    if (isNearBottom) {
      loadMoreResponses();
    }
  }, [isLoadingMore, page, totalPages, loadMoreResponses]);

  useEffect(() => {
    const contentElement = dialogContentRef.current;
    if (contentElement) {
      contentElement.addEventListener("scroll", handleScroll);
      return () => contentElement.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Get question-specific icon and color
  const getQuestionDetails = (qNum: number) => {
    switch (qNum) {
      case 6:
        return { icon: "👍", color: "text-green-600", bgColor: "bg-green-100" };
      case 7:
        return { icon: "👎", color: "text-red-600", bgColor: "bg-red-100" };
      case 8:
        return { icon: "💡", color: "text-blue-600", bgColor: "bg-blue-100" };
      case 10:
        return {
          icon: "❓",
          color: "text-purple-600",
          bgColor: "bg-purple-100",
        };
      default:
        return { icon: "📝", color: "text-gray-600", bgColor: "bg-gray-100" };
    }
  };

  const questionDetails = getQuestionDetails(questionNumber);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className={`${questionDetails.bgColor} ${questionDetails.color} px-2 py-1 rounded text-sm`}
            >
              {questionDetails.icon} Q{questionNumber}
            </span>
            <span className="text-green-800 font-inter">{questionText}</span>
          </DialogTitle>
          <DialogDescription className="font-inter">
            Viewing {displayedResponses.length} of {responses.length} total
            responses
          </DialogDescription>
        </DialogHeader>

        <div
          ref={dialogContentRef}
          className="flex-1 overflow-y-auto pr-4 space-y-4"
        >
          {displayedResponses.map((response, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 ${questionDetails.bgColor} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <span
                    className={`font-semibold text-sm ${questionDetails.color}`}
                  >
                    {(page - 1) * responsesPerPage + index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-700 whitespace-pre-line font-inter">
                    {response || (
                      <span className="text-gray-400 italic">No response</span>
                    )}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {response.length > 200 ? "Detailed" : "Brief"}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {response.length} characters
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isLoadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-green-800" />
            </div>
          )}

          {!isLoadingMore && page < totalPages && (
            <div className="text-center py-4">
              <Button
                variant="outline"
                onClick={loadMoreResponses}
                className="border-green-800 text-green-800 hover:bg-green-50"
              >
                <ChevronDown className="h-4 w-4 mr-2" />
                Load more responses (
                {responses.length - displayedResponses.length} remaining)
              </Button>
            </div>
          )}

          {page >= totalPages && responses.length > 0 && (
            <div className="text-center py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 font-inter">
                All {responses.length} responses loaded
              </p>
            </div>
          )}

          {responses.length === 0 && (
            <div className="text-center py-8">
              <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 italic font-inter">
                No responses recorded for this question
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
          <div className="text-sm text-gray-600 font-inter">
            Page {page} of {totalPages} • {responsesPerPage} responses per page
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="text-gray-600"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function FeedbacksPage() {
  const [selectedYear, setSelectedYear] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<IFeedback[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    wouldEnrollYes: 0,
    highRatings: 0,
    todaySubmissions: 0,
    avgRating: "0.0",
  });
  const [years, setYears] = useState<FilterOption[]>([
    { value: "all", label: "All Time" },
  ]);

  // AI Analysis state
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [aiCache, setAiCache] = useState<AICache>({});
  const [currentCacheKey, setCurrentCacheKey] = useState<string>("");
  const hasGeneratedBackground = useRef(false);
  const isLoadingData = useRef(false);

  // Separate dialog states for each essay question
  const [essayDialogStates, setEssayDialogStates] = useState({
    q6: { isOpen: false, responses: [] as string[] },
    q7: { isOpen: false, responses: [] as string[] },
    q8: { isOpen: false, responses: [] as string[] },
    q10: { isOpen: false, responses: [] as string[] },
  });

  // Store essay responses separately for each question
  const [essayResponses, setEssayResponses] = useState<
    Record<number, string[]>
  >({
    6: [],
    7: [],
    8: [],
    10: [],
  });

  // Question Analytics State
  const [questionAnalytics, setQuestionAnalytics] = useState<
    QuestionAnalytics[]
  >([
    {
      questionNumber: 1,
      questionText:
        "CHMSU has prepared me for job searching (including resume writing, handling job interviews, and other job search skills)",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      averageRating: 0,
      distribution: {},
      insights: [],
    },
    {
      questionNumber: 2,
      questionText:
        "My education in CHMSU has prepared me for my career (work related to degree earned)",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      averageRating: 0,
      distribution: {},
      insights: [],
    },
    {
      questionNumber: 3,
      questionText:
        "My education in CHMSU has prepared me for other jobs (work not related to degree earned)",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      averageRating: 0,
      distribution: {},
      insights: [],
    },
    {
      questionNumber: 4,
      questionText: "What VALUES did CHMSU help you develop in your life?",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
    {
      questionNumber: 5,
      questionText:
        "What SKILLS did CHMSU help you develop that you found useful in your life/work?",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
    {
      questionNumber: 6,
      questionText: "What did you LIKE MOST about your Alma Mater?",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
    {
      questionNumber: 7,
      questionText:
        "What did you NOT LIKE MOST about your Alma Mater that needs to be IMPROVED?",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
    {
      questionNumber: 8,
      questionText: "Any SUGGESTION(S) for CHMSU to be better?",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
    {
      questionNumber: 9,
      questionText: "Would you enroll your child or sibling in CHMSU?",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
    {
      questionNumber: 10,
      questionText: "Why? (Reason for recommendation)",
      responseCount: 0,
      responseRate: 0,
      mostCommonResponses: [],
      insights: [],
    },
  ]);

  // Load cache from localStorage on mount
  useEffect(() => {
    const savedCache = localStorage.getItem("aiAnalysisCache");
    if (savedCache) {
      try {
        const parsedCache = JSON.parse(savedCache);
        setAiCache(parsedCache);

        // Also check if we have a valid cache entry for the current data
        // This will be populated after data loads
        if (currentCacheKey && parsedCache[currentCacheKey]) {
          const cache = parsedCache[currentCacheKey];
          const now = Date.now();
          const oneDay = 24 * 60 * 60 * 1000;

          // Only use cache if it's less than 1 day old AND feedback count matches
          if (
            now - cache.timestamp < oneDay &&
            cache.feedbackCount === feedbacks.length
          ) {
            setAiAnalysis(cache.data);
          }
        }
      } catch (err) {
        console.error("Failed to parse AI cache:", err);
        setAiCache({});
      }
    }
  }, [currentCacheKey, feedbacks.length]);

  // Save cache to localStorage when it changes
  useEffect(() => {
    if (Object.keys(aiCache).length > 0) {
      localStorage.setItem("aiAnalysisCache", JSON.stringify(aiCache));
    }
  }, [aiCache]);

  const getRatingLabel = useCallback((rating: number): string => {
    if (rating >= 4.5) return "Strongly Agree";
    if (rating >= 4) return "Agree";
    if (rating >= 3) return "Neutral";
    if (rating >= 2) return "Disagree";
    return "Strongly Disagree";
  }, []);

  // Check if we need to generate new AI analysis
  const shouldGenerateNewAnalysis = useCallback(
    (cacheKey: string, feedbackCount: number) => {
      if (!aiCache[cacheKey]) return true;

      const cache = aiCache[cacheKey];
      const now = Date.now();
      const oneDay = 24 * 60 * 60 * 1000;

      // Check if cache is older than 1 day or feedback count changed
      return (
        now - cache.timestamp > oneDay || cache.feedbackCount !== feedbackCount
      );
    },
    [aiCache],
  );

  // Generate cache key - using same method as server
  const generateClientCacheKey = useCallback(async (feedbacks: IFeedback[]) => {
    const relevantData = feedbacks.map((f) => ({
      q1: f.jobSearchPreparation || 0,
      q2: f.careerPreparation || 0,
      q3: f.otherJobsPreparation || 0,
      q4: f.developedValues || [],
      q5: f.developedSkills || [],
      q6: f.likeMost || "",
      q7: f.needImprovement || "",
      q8: f.suggestions || "",
      q9: f.wouldEnroll || "",
      q10: f.whyReason || "",
    }));

    // Use the server function if available, otherwise generate locally
    try {
      // We need to create the same hash as the server
      const data = JSON.stringify(relevantData);
      return `ai-r1-${btoa(data).slice(0, 32)}`;
    } catch (err) {
      console.error("Failed to generate cache key:", err);
      return `ai-fallback-${Date.now()}`;
    }
  }, []);

  // Function to open essay response dialog for specific question
  const openEssayDialog = useCallback(
    (questionNumber: number, questionText: string) => {
      const responses =
        essayResponses[questionNumber as keyof typeof essayResponses] || [];

      // Update the specific dialog state
      setEssayDialogStates((prev) => ({
        ...prev,
        [`q${questionNumber}`]: {
          isOpen: true,
          responses,
        },
      }));
    },
    [essayResponses],
  );

  // Function to close essay response dialog for specific question
  const closeEssayDialog = useCallback((questionNumber: number) => {
    setEssayDialogStates((prev) => ({
      ...prev,
      [`q${questionNumber}`]: {
        ...prev[`q${questionNumber}` as keyof typeof prev],
        isOpen: false,
      },
    }));
  }, []);

  // Calculate question analytics
  const calculateQuestionAnalytics = useCallback(
    (data: IFeedback[]) => {
      if (!data.length) return;

      const totalResponses = data.length;

      const updatedAnalytics: QuestionAnalytics[] = [
        {
          questionNumber: 1,
          questionText:
            "CHMSU has prepared me for job searching (including resume writing, handling job interviews, and other job search skills)",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          averageRating: 0,
          distribution: {},
          insights: [],
        },
        {
          questionNumber: 2,
          questionText:
            "My education in CHMSU has prepared me for my career (work related to degree earned)",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          averageRating: 0,
          distribution: {},
          insights: [],
        },
        {
          questionNumber: 3,
          questionText:
            "My education in CHMSU has prepared me for other jobs (work not related to degree earned)",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          averageRating: 0,
          distribution: {},
          insights: [],
        },
        {
          questionNumber: 4,
          questionText: "What VALUES did CHMSU help you develop in your life?",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
        {
          questionNumber: 5,
          questionText:
            "What SKILLS did CHMSU help you develop that you found useful in your life/work?",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
        {
          questionNumber: 6,
          questionText: "What did you LIKE MOST about your Alma Mater?",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
        {
          questionNumber: 7,
          questionText:
            "What did you NOT LIKE MOST about your Alma Mater that needs to be IMPROVED?",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
        {
          questionNumber: 8,
          questionText: "Any SUGGESTION(S) for CHMSU to be better?",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
        {
          questionNumber: 9,
          questionText: "Would you enroll your child or sibling in CHMSU?",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
        {
          questionNumber: 10,
          questionText: "Why? (Reason for recommendation)",
          responseCount: 0,
          responseRate: 0,
          mostCommonResponses: [],
          insights: [],
        },
      ];

      // Extract essay responses for each question separately
      const likeMostResponses = data
        .filter((f) => f.likeMost && f.likeMost.trim().length > 0)
        .map((f) => f.likeMost!)
        .filter((r): r is string => r !== undefined && r.trim().length > 0);

      const improvementResponses = data
        .filter((f) => f.needImprovement && f.needImprovement.trim().length > 0)
        .map((f) => f.needImprovement!)
        .filter((r): r is string => r !== undefined && r.trim().length > 0);

      const suggestionResponses = data
        .filter((f) => f.suggestions && f.suggestions.trim().length > 0)
        .map((f) => f.suggestions!)
        .filter((r): r is string => r !== undefined && r.trim().length > 0);

      const reasonResponses = data
        .filter((f) => f.whyReason && f.whyReason.trim().length > 0)
        .map((f) => f.whyReason!)
        .filter((r): r is string => r !== undefined && r.trim().length > 0);

      // Update essay responses state for each question
      setEssayResponses({
        6: likeMostResponses,
        7: improvementResponses,
        8: suggestionResponses,
        10: reasonResponses,
      });

      // Update dialog states with the correct responses
      setEssayDialogStates((prev) => ({
        ...prev,
        q6: { ...prev.q6, responses: likeMostResponses },
        q7: { ...prev.q7, responses: improvementResponses },
        q8: { ...prev.q8, responses: suggestionResponses },
        q10: { ...prev.q10, responses: reasonResponses },
      }));

      // Question 1-3: Rating questions (1-5 scale)
      const ratingQuestions = [
        {
          index: 0,
          field: "jobSearchPreparation" as keyof IFeedback,
          label: "Job Search Preparation",
        },
        {
          index: 1,
          field: "careerPreparation" as keyof IFeedback,
          label: "Career Preparation",
        },
        {
          index: 2,
          field: "otherJobsPreparation" as keyof IFeedback,
          label: "Other Jobs Preparation",
        },
      ];

      ratingQuestions.forEach((q, qIndex) => {
        const distribution: Record<string, number> = {
          "1": 0,
          "2": 0,
          "3": 0,
          "4": 0,
          "5": 0,
        };
        let sum = 0;
        let count = 0;

        data.forEach((feedback) => {
          const rating = feedback[q.field];
          if (typeof rating === "number" && rating >= 1 && rating <= 5) {
            distribution[rating.toString()]++;
            sum += rating;
            count++;
          }
        });

        const averageRating = count > 0 ? sum / count : 0;
        const mostCommonRating = Object.entries(distribution)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(
            (
              [rating, count],
              idx,
            ): {
              answer: string;
              count: number;
              percentage: number;
              trend?: TrendType;
            } => ({
              answer: `${getRatingLabel(parseInt(rating))} (${rating}/5)`,
              count,
              percentage: (count / totalResponses) * 100,
              trend: idx === 0 ? "up" : idx === 1 ? "stable" : "down",
            }),
          );

        const insights = [];
        if (averageRating >= 4) insights.push("Strong positive feedback");
        else if (averageRating >= 3) insights.push("Moderately satisfied");
        else insights.push("Area needing improvement");

        updatedAnalytics[q.index] = {
          ...updatedAnalytics[q.index],
          responseCount: count,
          responseRate: (count / totalResponses) * 100,
          averageRating: parseFloat(averageRating.toFixed(1)),
          distribution,
          mostCommonResponses: mostCommonRating,
          insights,
        };
      });

      // Question 4: Values developed
      const valuesCount: Record<string, number> = {};
      data.forEach((feedback) => {
        feedback.developedValues?.forEach((value) => {
          if (value) {
            valuesCount[value] = (valuesCount[value] || 0) + 1;
          }
        });
      });

      const topValues = Object.entries(valuesCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(
          (
            [value, count],
            idx,
          ): {
            answer: string;
            count: number;
            percentage: number;
            trend?: TrendType;
          } => ({
            answer: value,
            count,
            percentage: (count / totalResponses) * 100,
            trend: idx === 0 ? "up" : idx === 1 ? "stable" : "down",
          }),
        );

      updatedAnalytics[3] = {
        ...updatedAnalytics[3],
        responseCount: Object.values(valuesCount).reduce((a, b) => a + b, 0),
        responseRate: 100,
        mostCommonResponses: topValues,
        insights:
          topValues.length > 0
            ? [
                `Most developed value: ${topValues[0].answer}`,
                `${topValues.length} distinct values identified`,
                `${topValues[0].count} alumni selected this`,
              ]
            : ["No values selected"],
      };

      // Question 5: Skills developed
      const skillsCount: Record<string, number> = {};
      data.forEach((feedback) => {
        feedback.developedSkills?.forEach((skill) => {
          if (skill) {
            skillsCount[skill] = (skillsCount[skill] || 0) + 1;
          }
        });
      });

      const topSkills = Object.entries(skillsCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(
          (
            [skill, count],
            idx,
          ): {
            answer: string;
            count: number;
            percentage: number;
            trend?: TrendType;
          } => ({
            answer: skill,
            count,
            percentage: (count / totalResponses) * 100,
            trend: idx === 0 ? "up" : idx === 1 ? "stable" : "down",
          }),
        );

      updatedAnalytics[4] = {
        ...updatedAnalytics[4],
        responseCount: Object.values(skillsCount).reduce((a, b) => a + b, 0),
        responseRate: 100,
        mostCommonResponses: topSkills,
        insights:
          topSkills.length > 0
            ? [
                `Most useful skill: ${topSkills[0].answer}`,
                `${topSkills.length} distinct skills identified`,
                `${topSkills[0].count} alumni reported this skill`,
              ]
            : ["No skills selected"],
      };

      // Question 6: Like Most - Simplified insights only
      updatedAnalytics[5] = {
        ...updatedAnalytics[5],
        responseCount: likeMostResponses.length,
        responseRate: (likeMostResponses.length / totalResponses) * 100,
        mostCommonResponses: [], // Empty for essay questions
        insights:
          likeMostResponses.length > 0
            ? [
                `${likeMostResponses.length} positive feedback responses`,
                "Click 'View All Responses' to read what alumni liked most",
                "Includes favorite aspects and memorable experiences",
              ]
            : ["No positive feedback received"],
      };

      // Question 7: Needs Improvement - Simplified insights only
      updatedAnalytics[6] = {
        ...updatedAnalytics[6],
        responseCount: improvementResponses.length,
        responseRate: (improvementResponses.length / totalResponses) * 100,
        mostCommonResponses: [], // Empty for essay questions
        insights:
          improvementResponses.length > 0
            ? [
                `${improvementResponses.length} constructive criticism responses`,
                "Click 'View All Responses' to read areas needing improvement",
                "Identifies specific institutional shortcomings",
              ]
            : ["No improvement suggestions received"],
      };

      // Question 8: Suggestions - Simplified insights only
      updatedAnalytics[7] = {
        ...updatedAnalytics[7],
        responseCount: suggestionResponses.length,
        responseRate: (suggestionResponses.length / totalResponses) * 100,
        mostCommonResponses: [], // Empty for essay questions
        insights:
          suggestionResponses.length > 0
            ? [
                `${suggestionResponses.length} actionable suggestion responses`,
                "Click 'View All Responses' to read all recommendations",
                "Alumni proposals for institutional enhancement",
              ]
            : ["No specific suggestions received"],
      };

      // Question 9: Would Enroll
      const yesCount = data.filter((f) => f.wouldEnroll === "Yes").length;
      const noCount = data.filter((f) => f.wouldEnroll === "No").length;

      updatedAnalytics[8] = {
        ...updatedAnalytics[8],
        responseCount: yesCount + noCount,
        responseRate: ((yesCount + noCount) / totalResponses) * 100,
        mostCommonResponses: [
          {
            answer: "Yes",
            count: yesCount,
            percentage: (yesCount / totalResponses) * 100,
            trend: yesCount > noCount ? "up" : "down",
          },
          {
            answer: "No",
            count: noCount,
            percentage: (noCount / totalResponses) * 100,
            trend: yesCount > noCount ? "down" : "up",
          },
        ].sort((a, b) => b.count - a.count),
        insights: [
          `Recommendation rate: ${totalResponses > 0 ? ((yesCount / totalResponses) * 100).toFixed(1) : "0.0"}%`,
          yesCount > noCount
            ? "Positive recommendation trend"
            : "Negative recommendation trend",
          `${Math.abs(yesCount - noCount)} response difference`,
        ],
      };

      // Question 10: Reasons - Simplified insights only
      updatedAnalytics[9] = {
        ...updatedAnalytics[9],
        responseCount: reasonResponses.length,
        responseRate: (reasonResponses.length / totalResponses) * 100,
        mostCommonResponses: [], // Empty for essay questions
        insights: [
          `${reasonResponses.length} detailed reasoning responses`,
          reasonResponses.length > 0
            ? "Click 'View All Responses' to read all decision factors"
            : "Limited reasoning provided",
          "Explains why alumni would/would not recommend CHMSU",
        ],
      };

      setQuestionAnalytics(updatedAnalytics);
    },
    [getRatingLabel],
  );

  // Generate AI analysis automatically in background when data loads
  const generateAIAnalysisBackground = useCallback(
    async (feedbacks: IFeedback[]) => {
      if (
        !feedbacks.length ||
        hasGeneratedBackground.current ||
        isLoadingData.current
      )
        return;

      // Generate cache key first
      const cacheKey = await generateClientCacheKey(feedbacks);
      setCurrentCacheKey(cacheKey);

      // Check cache first
      if (
        !shouldGenerateNewAnalysis(cacheKey, feedbacks.length) &&
        aiCache[cacheKey]
      ) {
        console.log("Using cached AI analysis from background");
        setAiAnalysis(aiCache[cacheKey].data);
        return;
      }

      // Mark that we're generating to prevent duplicate calls
      hasGeneratedBackground.current = true;
      isLoadingData.current = true;

      try {
        console.log("Generating AI analysis in background...");

        // Prepare feedback data for AI analysis
        const feedbacksForAI: FeedbackForAnalysis[] = feedbacks.map((f) => ({
          q1Rating: f.jobSearchPreparation,
          q2Rating: f.careerPreparation,
          q3Rating: f.otherJobsPreparation,
          q4Values: f.developedValues,
          q5Skills: f.developedSkills,
          q6LikeMost: f.likeMost || undefined,
          q7NeedsImprovement: f.needImprovement || undefined,
          q8Suggestions: f.suggestions || undefined,
          q9WouldEnroll: f.wouldEnroll,
          q10WhyReason: f.whyReason || undefined,
        }));

        const analysis = await generateAIAnalysis(feedbacksForAI);

        if (analysis) {
          // Update cache
          const newCache = {
            data: analysis,
            timestamp: Date.now(),
            feedbackCount: feedbacks.length,
            cacheKey,
          };

          setAiCache((prev) => ({
            ...prev,
            [cacheKey]: newCache,
          }));

          setAiAnalysis(analysis);
          console.log(
            "Background AI analysis generated and cached successfully",
          );
        }
      } catch (err) {
        console.error("Background AI analysis failed:", err);
        // Don't show error to user for background generation
      } finally {
        hasGeneratedBackground.current = false;
        isLoadingData.current = false;
      }
    },
    [aiCache, generateClientCacheKey, shouldGenerateNewAnalysis],
  );

  // Generate AI analysis on demand (user clicks button)
  const generateAIAnalysisManual = useCallback(async () => {
    if (!feedbacks.length || isGeneratingAI) return;

    setIsGeneratingAI(true);
    setError(null);

    try {
      // Generate the same cache key
      const cacheKey = await generateClientCacheKey(feedbacks);
      setCurrentCacheKey(cacheKey);

      // Check cache first - always check, even if we just generated in background
      if (
        !shouldGenerateNewAnalysis(cacheKey, feedbacks.length) &&
        aiCache[cacheKey]
      ) {
        console.log("Using cached AI analysis for manual request");
        setAiAnalysis(aiCache[cacheKey].data);
        return;
      }

      // If no valid cache, generate new analysis
      console.log("Generating new AI analysis (no valid cache found)...");

      // Prepare feedback data for AI analysis
      const feedbacksForAI: FeedbackForAnalysis[] = feedbacks.map((f) => ({
        q1Rating: f.jobSearchPreparation,
        q2Rating: f.careerPreparation,
        q3Rating: f.otherJobsPreparation,
        q4Values: f.developedValues,
        q5Skills: f.developedSkills,
        q6LikeMost: f.likeMost || undefined,
        q7NeedsImprovement: f.needImprovement || undefined,
        q8Suggestions: f.suggestions || undefined,
        q9WouldEnroll: f.wouldEnroll,
        q10WhyReason: f.whyReason || undefined,
      }));

      const analysis = await generateAIAnalysis(feedbacksForAI);

      if (analysis) {
        // Update cache
        const newCache = {
          data: analysis,
          timestamp: Date.now(),
          feedbackCount: feedbacks.length,
          cacheKey,
        };

        setAiCache((prev) => ({
          ...prev,
          [cacheKey]: newCache,
        }));

        setAiAnalysis(analysis);
      } else {
        throw new Error("Failed to generate AI analysis");
      }
    } catch (err: any) {
      console.error("Manual AI analysis failed:", err);
      setError(`AI Analysis Failed: ${err.message || "Unknown error"}`);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [
    feedbacks,
    aiCache,
    generateClientCacheKey,
    isGeneratingAI,
    shouldGenerateNewAnalysis,
  ]);

  const fetchFeedbackData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      isLoadingData.current = true;

      const data = await getFeedbacks();
      if (data && Array.isArray(data)) {
        setFeedbacks(data);
        calculateQuestionAnalytics(data);

        // Generate AI analysis in background
        generateAIAnalysisBackground(data);
      } else {
        setFeedbacks([]);
      }

      const statsData = await getFeedbackStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load feedback data");
      setFeedbacks([]);
    } finally {
      setIsLoading(false);
      isLoadingData.current = false;
    }
  }, [calculateQuestionAnalytics, generateAIAnalysisBackground]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const yearOptions = await getFeedbackYears();
      setYears(yearOptions);
    } catch (err: any) {
      setYears([{ value: "all", label: "All Time" }]);
    }
  }, []);

  useEffect(() => {
    fetchFeedbackData();
    fetchFilterOptions();
  }, []); // Run only once on mount

  const handleRefresh = useCallback(() => {
    // Reset the background generation flag so we can generate again if needed
    hasGeneratedBackground.current = false;
    fetchFeedbackData();
    fetchFilterOptions();
  }, [fetchFeedbackData, fetchFilterOptions]);

  const exportAnalytics = useCallback(() => {
    const csvContent = [
      [
        "Question Number",
        "Question Text",
        "Response Count",
        "Response Rate",
        "Most Common Responses",
        "AI Analysis Available",
      ],
      ...questionAnalytics.map((q) => [
        q.questionNumber.toString(),
        q.questionText,
        q.responseCount.toString(),
        `${q.responseRate.toFixed(1)}%`,
        q.mostCommonResponses
          .map((r) => `${r.answer}: ${r.count} (${r.percentage.toFixed(1)}%)`)
          .join("; "),
        aiAnalysis ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `feedback-analytics-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  }, [questionAnalytics, aiAnalysis]);

  // Component for AI Analysis Section with Poppins font
  const AIAnalysisSection = useCallback(() => {
    if (!aiAnalysis) return null;

    const sentimentColor = {
      positive: "bg-green-50 text-green-800 border-green-800",
      negative: "bg-red-50 text-red-600 border-red-600",
      neutral: "bg-gray-50 text-gray-700 border-gray-700",
      mixed: "bg-yellow-50 text-yellow-800 border-yellow-800",
    }[aiAnalysis.sentiment];

    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Bot className="h-6 w-6 text-blue-800" />
              </div>
              <div>
                <CardTitle className="text-blue-800 font-poppins font-medium">
                  AI-Powered Comprehensive Analysis
                </CardTitle>
                <CardDescription className="text-blue-600 font-poppins">
                  Based on analysis of {aiAnalysis.responseCount} complete
                  feedback responses
                </CardDescription>
              </div>
            </div>
            <Badge className={`${sentimentColor} font-poppins`}>
              {aiAnalysis.sentiment.toUpperCase()} (
              {(aiAnalysis.sentimentScore * 100).toFixed(0)}%)
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Executive Summary */}
          <div className="bg-white p-5 rounded-lg border border-blue-100">
            <h3 className="font-poppins font-medium text-blue-800 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Executive Summary
            </h3>
            <p className="text-gray-700 font-poppins whitespace-pre-line">
              {aiAnalysis.summary}
            </p>
          </div>

          {/* Detailed Analysis */}
          <div className="bg-white p-5 rounded-lg border border-blue-100">
            <h3 className="font-poppins font-medium text-blue-800 mb-3 flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Detailed Analysis
            </h3>
            <p className="text-gray-700 font-poppins whitespace-pre-line">
              {aiAnalysis.detailedAnalysis}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Key Findings */}
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h3 className="font-poppins font-medium text-blue-800 mb-3 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" />
                Key Findings
              </h3>
              <div className="space-y-2">
                {aiAnalysis.keyFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-800 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 font-poppins">
                      {finding}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Improvement Areas */}
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h3 className="font-poppins font-medium text-red-600 mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Areas for Improvement
              </h3>
              <div className="space-y-2">
                {aiAnalysis.improvementAreas.map((area, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-red-50 rounded-lg"
                  >
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm text-gray-700 font-poppins">
                      {area}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-4 rounded-lg border border-blue-100">
              <h3 className="font-poppins font-medium text-green-800 mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                AI Recommendations
              </h3>
              <div className="space-y-2">
                {aiAnalysis.recommendations.map((rec, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-green-50 rounded-lg"
                  >
                    <CheckCircle className="h-4 w-4 text-green-800 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 font-poppins">
                      {rec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-blue-200">
            <p className="text-xs text-gray-500 italic font-poppins">
              AI analysis generated on{" "}
              {new Date(aiAnalysis.timestamp).toLocaleDateString()} at{" "}
              {new Date(aiAnalysis.timestamp).toLocaleTimeString()} • Cached for
              24 hours or until new feedback is submitted
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }, [aiAnalysis]);

  if (isLoading && feedbacks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-5 w-64" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-inter">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-green-800 font-inter">
            Feedback Analytics Dashboard
          </h1>
          <p className="text-gray-700 font-inter">
            Comprehensive analysis of {stats.total} alumni feedback responses
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[180px] border-gray-300">
              <Calendar className="h-4 w-4 mr-2 text-gray-700" />
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem
                  key={year.value}
                  value={year.value}
                  className="font-inter"
                >
                  {year.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* AI Analysis Button */}
          <Button
            onClick={generateAIAnalysisManual}
            disabled={isGeneratingAI || !feedbacks.length}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white font-inter"
          >
            {isGeneratingAI ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                {aiAnalysis ? "Refresh AI Analysis" : "Generate AI Analysis"}
              </>
            )}
          </Button>

          <Button
            onClick={exportAnalytics}
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-50 font-inter"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Analytics
          </Button>
          <Button
            onClick={handleRefresh}
            variant="outline"
            disabled={isLoading}
            className="border-gray-300 text-gray-700 hover:bg-gray-50 font-inter"
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-600">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2 text-red-600" />
            <AlertDescription className="text-red-700 font-inter">
              {error}
              <div className="mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  className="border-red-600 text-red-600 hover:bg-red-50 font-inter"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* AI Analysis Section - Always shown when available */}
      {aiAnalysis && <AIAnalysisSection />}

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 font-inter">
              Total Responses
            </CardTitle>
            <Users className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 font-inter">
              {stats.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 font-inter">
              {stats.todaySubmissions} submitted today
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 font-inter">
              Would Recommend
            </CardTitle>
            <ThumbsUp className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 font-inter">
              {stats.wouldEnrollYes.toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 font-inter">
              {stats.total > 0
                ? `${Math.round((stats.wouldEnrollYes / stats.total) * 100)}% positive`
                : "No data"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 font-inter">
              Avg. Satisfaction
            </CardTitle>
            <Target className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-800 font-inter">
              {stats.avgRating}
              <span className="text-sm text-gray-600">/5</span>
            </div>
            <p className="text-xs text-gray-600 font-inter">
              {stats.highRatings} high satisfaction ratings
            </p>
          </CardContent>
        </Card>

        <Card className="border-gray-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-900 font-inter">
              AI Analysis Status
            </CardTitle>
            <Bot className="h-4 w-4 text-gray-700" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800 font-inter">
              {aiAnalysis ? "Ready" : "Pending"}
            </div>
            <p className="text-xs text-gray-600 font-inter">
              {aiAnalysis
                ? `${aiAnalysis.responseCount} responses analyzed`
                : feedbacks.length > 0
                  ? "Generating in background..."
                  : "No data"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Questions Analytics */}
      <div className="space-y-6">
        {questionAnalytics.map((question) => {
          const isEssayQuestion = [6, 7, 8, 10].includes(
            question.questionNumber,
          );
          const essayResponseCount =
            essayResponses[
              question.questionNumber as keyof typeof essayResponses
            ]?.length || 0;
          const hasRatingDistribution =
            question.distribution && !isEssayQuestion;

          return (
            <Card
              key={question.questionNumber}
              className="overflow-hidden border-gray-300"
            >
              <CardHeader className="bg-gray-50 border-b border-gray-300">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant="outline"
                        className="font-mono border-gray-400 text-gray-700 bg-gray-50"
                      >
                        Q{question.questionNumber}
                      </Badge>
                      <Badge className="text-xs border-gray-400 text-gray-700 bg-gray-50">
                        {question.responseRate.toFixed(0)}% Response Rate
                      </Badge>
                      {question.averageRating && (
                        <Badge
                          className={
                            question.averageRating >= 4
                              ? "bg-green-50 text-green-800 border-green-800"
                              : question.averageRating >= 3
                                ? "bg-yellow-50 text-yellow-800 border-yellow-800"
                                : "bg-red-50 text-red-600 border-red-600"
                          }
                        >
                          Avg: {question.averageRating.toFixed(1)}/5
                        </Badge>
                      )}
                      {isEssayQuestion && essayResponseCount > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs border-green-800 text-green-800 hover:bg-green-50"
                          onClick={() =>
                            openEssayDialog(
                              question.questionNumber,
                              question.questionText,
                            )
                          }
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View All Responses ({essayResponseCount})
                        </Button>
                      )}
                    </div>
                    <CardTitle className="text-lg font-semibold text-green-800 font-inter">
                      {question.questionText}
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-700 font-inter">
                      {question.responseCount} responses • Based on{" "}
                      {feedbacks.length} total submissions
                      {isEssayQuestion && essayResponseCount > 0 && (
                        <span className="ml-2 text-green-700">
                          • Click "View All Responses" to read detailed feedback
                        </span>
                      )}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Insights Section (Left side for all questions) */}
                  <div className="space-y-6">
                    {/* Key Insights */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-5">
                      <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 font-inter">
                        <Lightbulb className="h-4 w-4 text-gray-700" />
                        Key Insights
                      </h3>
                      <div className="space-y-3">
                        {question.insights.map((insight, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-200"
                          >
                            <CheckCircle className="h-5 w-5 text-green-800 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 font-inter">
                              {insight}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Most Common Responses (for non-essay questions) */}
                    {!isEssayQuestion &&
                      question.mostCommonResponses.length > 0 && (
                        <div className="bg-gray-50 border border-gray-300 rounded-lg p-5">
                          <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 font-inter">
                            <BarChart3 className="h-4 w-4 text-gray-700" />
                            Most Common Responses
                          </h3>
                          <div className="space-y-3">
                            {question.mostCommonResponses.map(
                              (response, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                        idx === 0
                                          ? "bg-gray-100 text-gray-900"
                                          : idx === 1
                                            ? "bg-gray-100 text-gray-800"
                                            : idx === 2
                                              ? "bg-gray-100 text-gray-700"
                                              : "bg-gray-100 text-gray-600"
                                      }`}
                                    >
                                      <span className="text-sm font-semibold">
                                        {idx + 1}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900 font-inter">
                                        {response.answer}
                                      </div>
                                      <div className="text-xs text-gray-600 font-inter">
                                        Selected by {response.count} alumni
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-lg font-bold text-green-800 font-inter">
                                      {response.percentage.toFixed(1)}%
                                    </div>
                                    <div className="text-xs text-gray-600 font-inter">
                                      of total
                                    </div>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                    {/* Essay Response Summary */}
                    {isEssayQuestion && essayResponseCount > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                        <h3 className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2 font-inter">
                          <MessageSquare className="h-4 w-4 text-green-700" />
                          Detailed Feedback Available
                        </h3>
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
                            <div className="w-2 h-2 bg-green-800 rounded-full mt-2 flex-shrink-0"></div>
                            <div className="flex-1">
                              <p className="text-sm text-gray-700 font-inter">
                                This question received {essayResponseCount}{" "}
                                detailed responses from alumni.
                              </p>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="mt-2 text-green-800 hover:text-green-900 hover:bg-green-100"
                                onClick={() =>
                                  openEssayDialog(
                                    question.questionNumber,
                                    question.questionText,
                                  )
                                }
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Read all responses ({essayResponseCount})
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right side - Rating Distribution OR Response Statistics */}
                  <div className="space-y-6">
                    {/* Rating Distribution (for rating questions only) */}
                    {hasRatingDistribution && (
                      <div className="bg-gray-50 border border-gray-300 rounded-lg p-5">
                        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2 font-inter">
                          <LineChart className="h-4 w-4 text-gray-700" />
                          Rating Distribution
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(question.distribution)
                            .sort(([a], [b]) => parseInt(b) - parseInt(a))
                            .map(([rating, count]) => (
                              <div
                                key={rating}
                                className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200"
                              >
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                      rating === "5"
                                        ? "bg-green-50 text-green-800 border border-green-800"
                                        : rating === "4"
                                          ? "bg-green-50 text-green-700 border border-green-700"
                                          : rating === "3"
                                            ? "bg-yellow-50 text-yellow-800 border border-yellow-800"
                                            : rating === "2"
                                              ? "bg-red-50 text-red-600 border border-red-600"
                                              : "bg-red-50 text-red-600 border border-red-600"
                                    }`}
                                  >
                                    <span className="font-bold">{rating}</span>
                                  </div>
                                  <div>
                                    <div className="font-medium text-gray-900 font-inter">
                                      {rating === "5"
                                        ? "Strongly Agree"
                                        : rating === "4"
                                          ? "Agree"
                                          : rating === "3"
                                            ? "Neutral"
                                            : rating === "2"
                                              ? "Disagree"
                                              : "Strongly Disagree"}
                                    </div>
                                    <div className="text-xs text-gray-600 font-inter">
                                      Rating
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-800 font-inter">
                                    {count}
                                  </div>
                                  <div className="text-xs text-gray-600 font-inter">
                                    {question.responseCount > 0
                                      ? (
                                          (count / question.responseCount) *
                                          100
                                        ).toFixed(0)
                                      : 0}
                                    %
                                  </div>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Response Statistics Card */}
                    <div className="bg-gray-50 border border-gray-300 rounded-lg p-5">
                      <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2 font-inter">
                        <BarChart3 className="h-4 w-4 text-gray-700" />
                        Response Statistics
                      </h3>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Users className="h-5 w-5 text-green-800" />
                            <div>
                              <div className="font-medium text-gray-900 font-inter">
                                Total Responses
                              </div>
                              <div className="text-xs text-gray-600 font-inter">
                                Alumni who answered
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-800 font-inter">
                              {question.responseCount}
                            </div>
                            <div className="text-xs text-gray-600 font-inter">
                              out of {feedbacks.length}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-3">
                            <Percent className="h-5 w-5 text-green-800" />
                            <div>
                              <div className="font-medium text-gray-900 font-inter">
                                Response Rate
                              </div>
                              <div className="text-xs text-gray-600 font-inter">
                                Percentage of total
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-800 font-inter">
                              {question.responseRate.toFixed(1)}%
                            </div>
                            <div className="text-xs text-gray-600 font-inter">
                              completion rate
                            </div>
                          </div>
                        </div>

                        {question.averageRating && (
                          <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                            <div className="flex items-center gap-3">
                              <Star className="h-5 w-5 text-green-800" />
                              <div>
                                <div className="font-medium text-gray-900 font-inter">
                                  Average Rating
                                </div>
                                <div className="text-xs text-gray-600 font-inter">
                                  Satisfaction score
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-green-800 font-inter">
                                {question.averageRating.toFixed(1)}/5
                              </div>
                              <div className="text-xs text-gray-600 font-inter">
                                {question.averageRating >= 4
                                  ? "High"
                                  : question.averageRating >= 3
                                    ? "Moderate"
                                    : "Low"}{" "}
                                satisfaction
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Summary - Simplified version */}
                {question.responseCount > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-300">
                    <h3 className="text-sm font-medium text-gray-900 mb-4 font-inter">
                      Quick Statistics
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <ResponseStatCard
                        title="Total Responses"
                        value={question.responseCount}
                        description="Number of alumni who answered"
                        icon={Users}
                        trend={
                          question.responseCount > feedbacks.length * 0.8
                            ? "up"
                            : "stable"
                        }
                      />

                      <ResponseStatCard
                        title="Response Rate"
                        value={`${question.responseRate.toFixed(1)}%`}
                        description="Percentage of total alumni"
                        icon={Percent}
                        trend={
                          question.responseRate > 80
                            ? "up"
                            : question.responseRate > 60
                              ? "stable"
                              : "down"
                        }
                      />

                      {question.averageRating ? (
                        <ResponseStatCard
                          title="Average Rating"
                          value={`${question.averageRating.toFixed(1)}/5`}
                          description="Satisfaction score"
                          icon={Star}
                          trend={
                            question.averageRating >= 4
                              ? "up"
                              : question.averageRating >= 3
                                ? "stable"
                                : "down"
                          }
                        />
                      ) : (
                        <ResponseStatCard
                          title="Detailed Feedback"
                          value={essayResponseCount}
                          description="Essay responses available"
                          icon={MessageSquare}
                          trend="up"
                        />
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Overall Summary */}
      <Card className="border-gray-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800 font-inter">
            <FileText className="h-5 w-5 text-gray-700" />
            Overall Feedback Summary
          </CardTitle>
          <CardDescription className="text-gray-700 font-inter">
            Key findings and recommendations based on all feedback analysis
            {aiAnalysis && (
              <span className="ml-2 text-blue-700">
                • AI analysis available
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2 font-inter">
                  <CheckCircle className="h-4 w-4 text-green-800" />
                  Strengths
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 font-inter">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span>
                      High satisfaction with career preparation (
                      {questionAnalytics[1].averageRating?.toFixed(1) || "0.0"}
                      /5)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span>
                      Strong values development reported (
                      {questionAnalytics[3].mostCommonResponses[0]?.percentage.toFixed(
                        1,
                      ) || "0.0"}
                      % selected top value)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span>
                      Positive recommendation rate (
                      {questionAnalytics[8].mostCommonResponses
                        .find((r) => r.answer === "Yes")
                        ?.percentage.toFixed(1) || "0.0"}
                      %)
                    </span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2 font-inter">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  Areas for Improvement
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 font-inter">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span>
                      Job search skills training (
                      {questionAnalytics[0].averageRating?.toFixed(1) || "0.0"}
                      /5 rating)
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span>
                      Facilities and infrastructure improvements needed
                    </span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-600 rounded-full"></div>
                    <span>Communication channels enhancement</span>
                  </li>
                </ul>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2 font-inter">
                  <Brain className="h-4 w-4 text-gray-700" />
                  Recommendations
                </h4>
                <ul className="space-y-2 text-sm text-gray-700 font-inter">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span>Enhance job placement services</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span>Invest in campus facilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-800 rounded-full"></div>
                    <span>Improve alumni communication channels</span>
                  </li>
                </ul>
              </div>
            </div>

            <Separator className="bg-gray-300" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2 font-inter">
                  <ThumbsUp className="h-4 w-4 text-green-800" />
                  Top Positive Aspects
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 font-inter">
                        Career Preparation
                      </span>
                      <Badge className="bg-green-50 text-green-800 border border-green-800">
                        {questionAnalytics[1].averageRating?.toFixed(1) ||
                          "0.0"}
                        /5
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 font-inter">
                      Highest rated aspect by alumni
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 font-inter">
                        Values Development
                      </span>
                      <Badge className="bg-green-50 text-green-800 border border-green-800">
                        {questionAnalytics[3].mostCommonResponses[0]?.percentage.toFixed(
                          1,
                        ) || "0.0"}
                        %
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 font-inter">
                      Most reported value:{" "}
                      {questionAnalytics[3].mostCommonResponses[0]?.answer ||
                        "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-red-600 mb-3 flex items-center gap-2 font-inter">
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  Key Improvement Areas
                </h4>
                <div className="space-y-3">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 font-inter">
                        Job Search Preparation
                      </span>
                      <Badge className="bg-red-50 text-red-600 border border-red-600">
                        {questionAnalytics[0].averageRating?.toFixed(1) ||
                          "0.0"}
                        /5
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 font-inter">
                      Lowest rated aspect needing attention
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900 font-inter">
                        Alumni Feedback Response
                      </span>
                      <Badge className="bg-red-50 text-red-600 border border-red-600">
                        {essayResponses[7]?.length || 0} responses
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 font-inter">
                      Detailed improvement suggestions available
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Statistics */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-300">
              <h4 className="font-semibold text-green-800 mb-4 font-inter">
                Overall Statistics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 font-inter">
                    {stats.total}
                  </div>
                  <div className="text-sm text-gray-600 font-inter">
                    Total Responses
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 font-inter">
                    {questionAnalytics.reduce(
                      (acc, q) => acc + (q.responseRate > 0 ? 1 : 0),
                      0,
                    )}
                    /10
                  </div>
                  <div className="text-sm text-gray-600 font-inter">
                    Questions Answered
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 font-inter">
                    {stats.total > 0
                      ? ((stats.wouldEnrollYes / stats.total) * 100).toFixed(1)
                      : "0.0"}
                    %
                  </div>
                  <div className="text-sm text-gray-600 font-inter">
                    Recommendation Rate
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-800 font-inter">
                    {stats.avgRating}
                  </div>
                  <div className="text-sm text-gray-600 font-inter">
                    Avg. Satisfaction
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Separate Dialogs for Each Essay Question */}
      <EssayResponseDialog
        questionNumber={6}
        questionText="What did you LIKE MOST about your Alma Mater?"
        responses={essayDialogStates.q6.responses}
        isOpen={essayDialogStates.q6.isOpen}
        onOpenChange={(open) => {
          if (!open) closeEssayDialog(6);
        }}
      />

      <EssayResponseDialog
        questionNumber={7}
        questionText="What did you NOT LIKE MOST about your Alma Mater that needs to be IMPROVED?"
        responses={essayDialogStates.q7.responses}
        isOpen={essayDialogStates.q7.isOpen}
        onOpenChange={(open) => {
          if (!open) closeEssayDialog(7);
        }}
      />

      <EssayResponseDialog
        questionNumber={8}
        questionText="Any SUGGESTION(S) for CHMSU to be better?"
        responses={essayDialogStates.q8.responses}
        isOpen={essayDialogStates.q8.isOpen}
        onOpenChange={(open) => {
          if (!open) closeEssayDialog(8);
        }}
      />

      <EssayResponseDialog
        questionNumber={10}
        questionText="Why? (Reason for recommendation)"
        responses={essayDialogStates.q10.responses}
        isOpen={essayDialogStates.q10.isOpen}
        onOpenChange={(open) => {
          if (!open) closeEssayDialog(10);
        }}
      />
    </div>
  );
}
