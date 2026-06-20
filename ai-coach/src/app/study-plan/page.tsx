"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, BookOpen, Clock, AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Task {
  _id: string;
  topic: string;
  task: string;
  priority: "High" | "Medium" | "Low";
  estimatedTime: string;
  status: "pending" | "completed";
}

interface Plan {
  _id: string;
  focusAreas: string[];
  tasks: Task[];
}

function StudyPlanContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("sessionId");

  const [isLoading, setIsLoading] = useState(true);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStudyPlan = async () => {
    try {
      const res = await fetch("/api/learning-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch study plan.");

      setPlan(data.plan);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while loading the study plan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudyPlan();
  }, [sessionId]);

  const handleToggleTask = async (taskId: string) => {
    if (!plan) return;

    // Optimistic UI update
    const updatedTasks = plan.tasks.map((t) =>
      t._id === taskId
        ? { ...t, status: (t.status === "completed" ? "pending" : "completed") as "pending" | "completed" }
        : t
    );
    setPlan({ ...plan, tasks: updatedTasks });

    try {
      const res = await fetch("/api/learning-plan/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyPlanId: plan._id,
          taskId,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      // Synced database plan
      setPlan(data.plan);
    } catch (err) {
      console.error("Failed to toggle task in DB, rolling back:", err);
      // Rollback optimistic update
      fetchStudyPlan();
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading your personalized study plan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-destructive mx-auto" />
        <h2 className="text-xl font-bold">Error Loading Study Plan</h2>
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link href="/" className="inline-block mt-4">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto" />
        <h2 className="text-xl font-bold">No Study Plan Found</h2>
        <p className="text-sm text-muted-foreground">
          You haven't completed any mock interviews yet. Generate a study plan by finishing an interview.
        </p>
        <Link href="/" className="inline-block mt-4">
          <Button>Start Mock Interview</Button>
        </Link>
      </div>
    );
  }

  const completedTasks = plan.tasks.filter((t) => t.status === "completed").length;
  const progressPercent = Math.round((completedTasks / plan.tasks.length) * 100);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case "High":
        return "text-red-700 bg-red-500/10 border-red-500/20";
      case "Medium":
        return "text-amber-700 bg-amber-500/10 border-amber-500/20";
      case "Low":
      default:
        return "text-muted-foreground bg-muted border-border";
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link href="/" className="inline-flex items-center text-xs text-muted-foreground hover:text-primary mb-2 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Your Personalized Study Plan</h1>
          <p className="text-muted-foreground text-sm">Focus areas and actionable tasks created specifically from your weak points.</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-2xl px-6 py-4 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-black text-primary">{progressPercent}%</span>
          <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mt-1">Completed</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-3 rounded-full overflow-hidden shadow-inner">
        <div 
          className="bg-primary h-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Focus Areas */}
        <div className="space-y-6 lg:col-span-1">
          <Card className="border-primary/10 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <BookOpen className="w-5 h-5 mr-2 text-primary" />
                Focus Topics
              </CardTitle>
              <CardDescription>Major core themes to concentrate on.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.focusAreas.map((area, idx) => (
                <div key={idx} className="flex items-center space-x-3 bg-muted/40 p-3 rounded-xl border border-muted">
                  <span className="text-xs font-bold text-muted-foreground bg-background border rounded px-2 py-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-foreground/90">{area}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Task List */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-muted shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Actionable Study List</CardTitle>
              <CardDescription>Complete the exercises below to improve in future mocks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {plan.tasks.map((task) => {
                const isCompleted = task.status === "completed";

                return (
                  <div
                    key={task._id}
                    className={`flex items-start justify-between border rounded-xl p-4 transition-all gap-4 ${
                      isCompleted ? "bg-muted/30 border-muted opacity-75" : "bg-card hover:bg-muted/10 border-border"
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <Checkbox
                        id={task._id}
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleTask(task._id)}
                        className="mt-1 border-muted-foreground/30 focus-visible:ring-primary h-5 w-5 rounded-md"
                      />
                      
                      <div className="space-y-1">
                        <label
                          htmlFor={task._id}
                          className={`text-sm font-semibold cursor-pointer ${
                            isCompleted ? "line-through text-muted-foreground" : "text-foreground"
                          }`}
                        >
                          {task.task}
                        </label>
                        
                        <div className="flex flex-wrap gap-2 pt-1 text-[10px] font-semibold uppercase tracking-wide">
                          <span className="bg-muted border px-2 py-0.5 rounded text-muted-foreground">
                            {task.topic}
                          </span>
                          <span className={`border px-2 py-0.5 rounded flex items-center ${getPriorityStyle(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 shrink-0 text-muted-foreground text-xs font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{task.estimatedTime}</span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudyPlanPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-sm text-muted-foreground">Loading search parameters...</p>
        </div>
      }
    >
      <StudyPlanContent />
    </Suspense>
  );
}
