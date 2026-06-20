"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, Calendar, Award, ArrowRight, Activity, Plus } from "lucide-react";
import Link from "next/link";

interface Session {
  id: string;
  role: string;
  company: string;
  mode: string;
  status: "active" | "completed";
  startedAt: string;
  avgScore: number;
  answersCount: number;
}

export default function InterviewsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await fetch("/api/interview/list", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setSessions(data.sessions || []);
      }
    } catch (err) {
      console.error("Failed to load interview history:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
        <p className="text-sm text-muted-foreground">Loading interview history...</p>
      </div>
    );
  }

  // Calculate statistics
  const totalMocks = sessions.length;
  const completedMocks = sessions.filter(s => s.status === "completed");
  const overallAvg = completedMocks.length > 0 
    ? completedMocks.reduce((acc, s) => acc + s.avgScore, 0) / completedMocks.length
    : 0;

  return (
    <div className="space-y-8 max-w-5xl mx-auto p-6 md:p-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Interviews</h1>
          <p className="text-muted-foreground text-sm">Review your performance across past mock interviews and track progress.</p>
        </div>
        <Link href="/">
          <Button className="shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4 mr-2" />
            New Interview
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="border-muted shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Mock Mocks</span>
              <p className="text-3xl font-black">{totalMocks}</p>
            </div>
            <div className="bg-primary/10 p-3 rounded-2xl">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Average Mock Score</span>
              <p className="text-3xl font-black">{overallAvg > 0 ? overallAvg.toFixed(1) : "N/A"}</p>
            </div>
            <div className="bg-indigo-500/10 p-3 rounded-2xl">
              <Award className="w-6 h-6 text-indigo-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-muted shadow-sm">
          <CardContent className="pt-6 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Active Sessions</span>
              <p className="text-3xl font-black">{sessions.filter(s => s.status === "active").length}</p>
            </div>
            <div className="bg-green-500/10 p-3 rounded-2xl">
              <Activity className="w-6 h-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interviews Table/List */}
      <Card className="border-muted shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">History log</CardTitle>
          <CardDescription>A list of all mock sessions started under this guest session.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.map((sess) => (
            <div
              key={sess.id}
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border rounded-xl hover:bg-muted/10 transition-colors gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <h4 className="font-semibold text-sm">{sess.role}</h4>
                  <span className={`text-[10px] border font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    sess.status === "completed"
                      ? "text-green-600 bg-green-500/10 border-green-500/20"
                      : "text-amber-600 bg-amber-500/10 border-amber-500/20"
                  }`}>
                    {sess.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    {new Date(sess.startedAt).toLocaleDateString()}
                  </span>
                  <span>Company: {sess.company}</span>
                  <span className="capitalize">Mode: {sess.mode.replace("-", " ")}</span>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                {sess.status === "completed" && (
                  <div className="text-right shrink-0">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <p className="font-bold text-sm text-foreground">{sess.avgScore.toFixed(1)} / 10</p>
                  </div>
                )}
                
                <Link href={`/interviews/${sess.id}`} className="shrink-0 w-full sm:w-auto">
                  <Button variant={sess.status === "active" ? "default" : "outline"} className="w-full text-xs">
                    {sess.status === "active" ? "Resume" : "View Results"}
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No interview sessions found. Create a new mock interview session to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
