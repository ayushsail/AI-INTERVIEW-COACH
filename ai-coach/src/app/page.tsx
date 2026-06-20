"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Loader2, Play } from "lucide-react";
import ResumeUploadArea from "@/components/resume/ResumeUploadArea";
import ProfileSummary from "@/components/resume/ProfileSummary";
import InterviewStartForm from "@/components/interview/InterviewStartForm";

export default function DashboardPage() {
  const router = useRouter();
  const [step, setStep] = useState<"upload" | "parsing" | "verify" | "configure">("upload");
  const [resumeId, setResumeId] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);

  const handleUploadSuccess = async (id: string) => {
    setResumeId(id);
    setStep("parsing");
    setError(null);

    try {
      const res = await fetch("/api/resume-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to parse resume.");
      }

      setParsedData(data.data);
      setStep("verify");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while parsing your resume.");
      setStep("upload");
    }
  };

  const handleProfileConfirm = (finalData: any) => {
    setParsedData(finalData);
    setStep("configure");
  };

  const handleStartSession = async (config: { role: string; company: string; experienceLevel: string; mode: string }) => {
    if (!resumeId) return;
    setIsStarting(true);
    setError(null);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeId,
          role: config.role,
          company: config.company,
          mode: config.mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start interview session.");
      }

      // Redirect to the live interview session page
      router.push(`/interviews/${data.sessionId}`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to start interview session.");
      setIsStarting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6 md:p-8">
      {error && (
        <div className="bg-destructive/10 text-destructive border border-destructive/20 rounded-xl p-4 text-sm">
          {error}
        </div>
      )}

      {step === "upload" && (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to AI Interview Coach</h1>
            <p className="text-muted-foreground mt-2">Upload your resume to start a personalized interview session.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="col-span-1 lg:col-span-2 border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-5 h-5 mr-2 text-primary" />
                  Upload Resume
                </CardTitle>
                <CardDescription>
                  We'll parse your skills and experience to tailor your interview questions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResumeUploadArea onUploadSuccess={handleUploadSuccess} />
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">No recent interviews found. Upload a resume to begin.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {step === "parsing" && (
        <div className="flex flex-col items-center justify-center py-20 space-y-6">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <div className="text-center space-y-2">
            <h2 className="text-xl font-semibold">Parsing Your Resume</h2>
            <p className="text-sm text-muted-foreground">Gemini AI is analyzing skills, projects, and work history to prepare questions...</p>
          </div>
        </div>
      )}

      {step === "verify" && parsedData && (
        <ProfileSummary parsedData={parsedData} onConfirm={handleProfileConfirm} />
      )}

      {step === "configure" && (
        <InterviewStartForm
          initialRoleSuggestion={parsedData?.targetRoleHints || ""}
          onSubmit={handleStartSession}
          isLoading={isStarting}
        />
      )}
    </div>
  );
}
