import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import StudyPlan from "@/models/StudyPlan";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { studyPlanId, taskId } = body;

    if (!studyPlanId || !taskId) {
      return NextResponse.json({ error: "Missing studyPlanId or taskId" }, { status: 400 });
    }

    const plan = await StudyPlan.findById(studyPlanId);
    if (!plan) {
      return NextResponse.json({ error: "Study plan not found" }, { status: 404 });
    }

    // Find and toggle the task status
    const task = plan.tasks.id(taskId);
    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';
    await plan.save();

    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    console.error("Toggle task error:", error);
    return NextResponse.json(
      { error: "Failed to toggle task" },
      { status: 500 }
    );
  }
}
