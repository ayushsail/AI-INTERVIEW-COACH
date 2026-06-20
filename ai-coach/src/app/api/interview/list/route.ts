import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import Answer from "@/models/Answer";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Fetch sessions for guest sorted by startedAt desc
    const sessions = await InterviewSession.find({ userId: 'guest' }).sort({ startedAt: -1 });

    const formattedSessions = await Promise.all(
      sessions.map(async (sess) => {
        const answers = await Answer.find({ sessionId: sess._id });
        let avgScore = 0;

        if (answers.length > 0) {
          const total = answers.reduce(
            (acc, ans) =>
              acc +
              (ans.scoreTechnical +
                ans.scoreCommunication +
                ans.scoreConfidence +
                ans.scoreStructure +
                ans.scoreRelevance),
            0
          );
          avgScore = total / (answers.length * 5);
        }

        return {
          id: sess._id,
          role: sess.role,
          company: sess.company,
          mode: sess.mode,
          status: sess.status,
          startedAt: sess.startedAt,
          avgScore: Math.round(avgScore * 10) / 10,
          answersCount: answers.length,
        };
      })
    );

    return NextResponse.json({ success: true, sessions: formattedSessions });
  } catch (error: any) {
    console.error("List sessions error:", error);
    return NextResponse.json(
      { error: "Failed to list interview sessions" },
      { status: 500 }
    );
  }
}
