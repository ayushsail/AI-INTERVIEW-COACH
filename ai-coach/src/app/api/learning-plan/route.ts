import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";
import Answer from "@/models/Answer";
import StudyPlan from "@/models/StudyPlan";
import Memory from "@/models/Memory";
import { generateLearningPlan } from "@/lib/ai/learningPlanGenerator";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { sessionId } = body || {};

    if (!sessionId) {
      // Fetch the latest study plan generated for the guest user
      const latestPlan = await StudyPlan.findOne({ userId: 'guest' }).sort({ createdAt: -1 });
      return NextResponse.json({ success: true, plan: latestPlan });
    }

    // Check if learning plan already exists for this session
    const existingPlan = await StudyPlan.findOne({ sessionId });
    if (existingPlan) {
      return NextResponse.json({ success: true, plan: existingPlan });
    }

    const session = await InterviewSession.findById(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch all answers for the session
    const answers = await Answer.find({ sessionId });
    if (answers.length === 0) {
      return NextResponse.json({ error: "No answers found for this session to generate plan" }, { status: 400 });
    }

    // Collect weaknesses and compute average scores
    const weaknessTagsSet = new Set<string>();
    let totalTech = 0, totalComm = 0, totalConf = 0, totalStruct = 0, totalRel = 0;

    answers.forEach(ans => {
      ans.weaknessTags?.forEach((tag: string) => weaknessTagsSet.add(tag));
      totalTech += ans.scoreTechnical;
      totalComm += ans.scoreCommunication;
      totalConf += ans.scoreConfidence;
      totalStruct += ans.scoreStructure;
      totalRel += ans.scoreRelevance;
    });

    const numAnswers = answers.length;
    const avgScores = {
      technical: Math.round((totalTech / numAnswers) * 10) / 10,
      communication: Math.round((totalComm / numAnswers) * 10) / 10,
      confidence: Math.round((totalConf / numAnswers) * 10) / 10,
      structure: Math.round((totalStruct / numAnswers) * 10) / 10,
      relevance: Math.round((totalRel / numAnswers) * 10) / 10,
    };

    const weaknessTags = Array.from(weaknessTagsSet);

    // Call AI Learning Plan generator
    const planData = await generateLearningPlan({
      weaknessTags,
      interviewScores: avgScores,
      targetRole: session.role,
    });

    // Save Study Plan to database
    const studyPlan = await StudyPlan.create({
      userId: session.userId || 'guest',
      sessionId: session._id,
      focusAreas: planData.focusAreas,
      tasks: planData.tasks.map(t => ({
        topic: t.topic,
        task: t.task,
        priority: t.priority,
        estimatedTime: t.estimatedTime,
        status: 'pending',
      })),
    });

    // Save identified weakness focus areas into Memory Store
    for (const tag of weaknessTags) {
      await Memory.findOneAndUpdate(
        { userId: session.userId || 'guest', topic: tag },
        {
          $set: { lastUpdated: new Date() },
          $setOnInsert: {
            summary: `Demonstrated weakness in ${tag} during mock interview for ${session.role}.`,
            tags: ['weakness', tag.toLowerCase()],
          }
        },
        { upsert: true }
      );
    }

    return NextResponse.json({ success: true, plan: studyPlan });
  } catch (error: any) {
    console.error("Generate learning plan API error:", error);
    return NextResponse.json(
      { error: "Failed to generate learning plan" },
      { status: 500 }
    );
  }
}
