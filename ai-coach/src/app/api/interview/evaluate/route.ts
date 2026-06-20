import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import Resume from "@/models/Resume";
import Question from "@/models/Question";
import Answer from "@/models/Answer";
import { evaluateUserAnswer } from "@/lib/ai/evaluationEngine";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId, questionId, answerText } = body;

    if (!sessionId || !questionId || !answerText) {
      return NextResponse.json(
        { error: "Missing required fields (sessionId, questionId, answerText)" },
        { status: 400 }
      );
    }

    const questionDoc = await Question.findById(questionId);
    if (!questionDoc) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const resume = await Resume.findById(session.resumeId);
    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    // Call AI Evaluation
    const evaluation = await evaluateUserAnswer({
      question: questionDoc.question,
      expectedSignals: questionDoc.expectedSignals || [],
      userAnswer: answerText,
      candidateProfile: resume.parsedData || {},
    });

    // Save Answer document
    const answerDoc = await Answer.create({
      sessionId,
      questionId,
      answerText,
      scoreTechnical: evaluation.scoreTechnical,
      scoreCommunication: evaluation.scoreCommunication,
      scoreConfidence: evaluation.scoreConfidence,
      scoreStructure: evaluation.scoreStructure,
      scoreRelevance: evaluation.scoreRelevance,
      feedback: `${evaluation.feedbackStrong}\n\n${evaluation.feedbackWeak}\n\n${evaluation.feedbackImprovement}`,
      weaknessTags: evaluation.weaknessTags,
    });

    return NextResponse.json({
      success: true,
      answerId: answerDoc._id,
      evaluation: {
        scoreTechnical: evaluation.scoreTechnical,
        scoreCommunication: evaluation.scoreCommunication,
        scoreConfidence: evaluation.scoreConfidence,
        scoreStructure: evaluation.scoreStructure,
        scoreRelevance: evaluation.scoreRelevance,
        feedbackStrong: evaluation.feedbackStrong,
        feedbackWeak: evaluation.feedbackWeak,
        feedbackImprovement: evaluation.feedbackImprovement,
        mistakes: evaluation.mistakes,
        weaknessTags: evaluation.weaknessTags,
        examplePracticeTopic: evaluation.examplePracticeTopic,
      }
    });
  } catch (error: any) {
    console.error("Evaluate answer API error:", error);
    return NextResponse.json(
      { error: "Failed to evaluate answer" },
      { status: 500 }
    );
  }
}
