"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import InterviewChat from "@/components/interview/InterviewChat";
import InterviewResults from "@/components/interview/InterviewResults";

interface QaPair {
  questionId: string;
  question: string;
  category: string;
  difficulty: string;
  expectedSignals?: string[];
  answerText: string | null;
  scoreTechnical: number;
  scoreCommunication: number;
  scoreConfidence: number;
  scoreStructure: number;
  scoreRelevance: number;
  feedback: string | null;
  weaknessTags: string[];
}

export default function InterviewSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: sessionId } = use(params);

  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [qaPairs, setQaPairs] = useState<QaPair[]>([]);
  
  // Current active question state
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [isSending, setIsSending] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);

  // Fetch complete session details
  const fetchSessionDetails = async () => {
    try {
      const res = await fetch("/api/interview/details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setSession(data.session);
      setQaPairs(data.qaPairs);

      // If active, fetch the next question
      if (data.session.status === "active") {
        await fetchNextQuestion();
      } else {
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error loading session:", err);
      setIsLoading(false);
    }
  };

  // Fetch next question (or check if finished)
  const fetchNextQuestion = async () => {
    try {
      const res = await fetch("/api/interview/next", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      if (data.isFinished) {
        setSession((prev: any) => ({ ...prev, status: "completed" }));
        setCurrentQuestion(null);
      } else {
        setCurrentQuestion(data);
      }
    } catch (err) {
      console.error("Error getting question:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessionDetails();
  }, [sessionId]);

  const handleSendAnswer = async (answerText: string) => {
    if (!currentQuestion) return;
    setIsSending(true);

    try {
      const res = await fetch("/api/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          questionId: currentQuestion.questionId,
          answerText,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Reload entire details to synchronize lists
      await fetchSessionDetails();
    } catch (err) {
      console.error("Error evaluating answer:", err);
    } finally {
      setIsSending(false);
    }
  };

  const handleGenerateStudyPlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const res = await fetch("/api/learning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Redirect to the study plan dashboard
      router.push(`/study-plan?sessionId=${sessionId}`);
    } catch (err) {
      console.error("Error generating learning plan:", err);
      setIsGeneratingPlan(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading interview details...</p>
      </div>
    );
  }

  if (session?.status === "completed") {
    // Format QA Pairs for results screen (only keep questions that have answers)
    const completedAnswers = qaPairs
      .filter(qa => qa.answerText !== null)
      .map(qa => ({
        question: qa.question,
        answerText: qa.answerText || "",
        scoreTechnical: qa.scoreTechnical,
        scoreCommunication: qa.scoreCommunication,
        scoreConfidence: qa.scoreConfidence,
        scoreStructure: qa.scoreStructure,
        scoreRelevance: qa.scoreRelevance,
        feedback: qa.feedback || "",
        weaknessTags: qa.weaknessTags,
      }));

    return (
      <div className="p-6 md:p-8">
        <InterviewResults
          sessionId={sessionId}
          answers={completedAnswers}
          onGenerateStudyPlan={handleGenerateStudyPlan}
          isGeneratingPlan={isGeneratingPlan}
          hasStudyPlan={false}
        />
      </div>
    );
  }

  // Active Chat Session
  if (currentQuestion) {
    const answeredCount = qaPairs.filter(qa => qa.answerText !== null).length;

    return (
      <div className="p-6 md:p-8">
        <InterviewChat
          question={currentQuestion}
          qNum={answeredCount + 1}
          totalQ={5}
          onSendAnswer={handleSendAnswer}
          isSending={isSending}
        />
      </div>
    );
  }

  return (
    <div className="p-6 text-center text-muted-foreground">
      Something went wrong loading the session questions.
    </div>
  );
}
