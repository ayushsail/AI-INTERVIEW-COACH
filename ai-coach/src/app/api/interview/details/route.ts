import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import Question from "@/models/Question";
import Answer from "@/models/Answer";

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

    const questions = await Question.find({ sessionId }).sort({ createdAt: 1 });
    const answers = await Answer.find({ sessionId });

    // Combine questions and answers in order
    const qaPairs = questions.map(q => {
      const ans = answers.find(a => a.questionId.toString() === q._id.toString());
      return {
        questionId: q._id,
        question: q.question,
        category: q.category,
        difficulty: q.difficulty,
        expectedSignals: q.expectedSignals,
        answerText: ans ? ans.answerText : null,
        scoreTechnical: ans ? ans.scoreTechnical : 0,
        scoreCommunication: ans ? ans.scoreCommunication : 0,
        scoreConfidence: ans ? ans.scoreConfidence : 0,
        scoreStructure: ans ? ans.scoreStructure : 0,
        scoreRelevance: ans ? ans.scoreRelevance : 0,
        feedback: ans ? ans.feedback : null,
        weaknessTags: ans ? ans.weaknessTags : [],
      };
    });

    return NextResponse.json({
      success: true,
      session: {
        id: session._id,
        role: session.role,
        company: session.company,
        mode: session.mode,
        status: session.status,
      },
      qaPairs,
    });
  } catch (error: any) {
    console.error("Fetch interview details error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session details" },
      { status: 500 }
    );
  }
}
