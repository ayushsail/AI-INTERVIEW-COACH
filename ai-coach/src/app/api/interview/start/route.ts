import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import InterviewSession from "@/models/InterviewSession";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { resumeId, role, company, mode } = body;

    if (!resumeId || !role) {
      return NextResponse.json(
        { error: "Missing required fields (resumeId, role)" },
        { status: 400 }
      );
    }

    const session = await InterviewSession.create({
      resumeId,
      role,
      company: company || "Generic",
      mode: mode || "full-mock",
      status: "active",
      startedAt: new Date(),
    });

    return NextResponse.json({ success: true, sessionId: session._id });
  } catch (error: any) {
    console.error("Start interview session error:", error);
    return NextResponse.json(
      { error: "Failed to start interview session" },
      { status: 500 }
    );
  }
}
