import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import Resume from "@/models/Resume";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import { generateNextQuestion } from "@/lib/ai/interviewGenerator";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (session.status === "completed") {
      return NextResponse.json({ isFinished: true });
    }

    // Get candidate profile
    const resume = await Resume.findById(session.resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Get previous questions and answers
    const questions = await Question.find({ sessionId }).sort({ createdAt: 1 });
    const answers = await Answer.find({ sessionId });

    // Idempotency check: if the latest question has no answer yet, return it
    if (questions.length > 0) {
      const latestQuestion = questions[questions.length - 1];
      const hasAnswer = answers.some(ans => ans.questionId.toString() === latestQuestion._id.toString());
      if (!hasAnswer) {
        return NextResponse.json({
          isFinished: false,
          questionId: latestQuestion._id,
          question: latestQuestion.question,
          category: latestQuestion.category,
          difficulty: latestQuestion.difficulty,
          expectedSignals: latestQuestion.expectedSignals,
        });
      }
    }

    // Check if limit is reached (5 questions total)
    const QUESTION_LIMIT = 5;
    if (questions.length >= QUESTION_LIMIT) {
      session.status = "completed";
      session.endedAt = new Date();
      await session.save();
      return NextResponse.json({ isFinished: true });
    }

    // Format previous questions & answers for the generator prompt
    const formattedQuestions = questions.map(q => ({
      question: q.question,
      category: q.category,
    }));

    const formattedAnswers = answers.map(a => ({
      answerText: a.answerText,
      weaknessTags: a.weaknessTags,
    }));

    // Generate new question
    const generated = await generateNextQuestion({
      resumeSummary: resume.parsedData || {},
      targetRole: session.role,
      experienceLevel: "Mid-Senior", // Default context
      company: session.company,
      mode: session.mode,
      previousQuestions: formattedQuestions,
      previousAnswers: formattedAnswers,
    });

    // Save to database
    const newQuestion = await Question.create({
      sessionId,
      question: generated.question,
      category: generated.category,
      difficulty: generated.difficulty,
      expectedSignals: generated.expectedSignals,
    });

    return NextResponse.json({
      isFinished: false,
      questionId: newQuestion._id,
      question: newQuestion.question,
      category: newQuestion.category,
      difficulty: newQuestion.difficulty,
      expectedSignals: newQuestion.expectedSignals,
    });
  } catch (error: any) {
    console.error("Next question API error:", error);
    return NextResponse.json(
      { error: "Failed to generate next question" },
      { status: 500 }
    );
  }
}
