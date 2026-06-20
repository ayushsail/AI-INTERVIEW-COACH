"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles, Building2, UserCheck, Flame } from "lucide-react";

interface InterviewStartFormProps {
  initialRoleSuggestion?: string;
  onSubmit: (config: { role: string; company: string; experienceLevel: string; mode: string }) => void;
  isLoading?: boolean;
}

export default function InterviewStartForm({ initialRoleSuggestion = "", onSubmit, isLoading = false }: InterviewStartFormProps) {
  const [role, setRole] = useState(initialRoleSuggestion || "Software Engineer");
  const [company, setCompany] = useState("Generic");
  const [level, setLevel] = useState("Mid");
  const [mode, setMode] = useState("full-mock");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role.trim()) return;
    onSubmit({ role: role.trim(), company: company.trim(), experienceLevel: level, mode });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Configure Your Session</h2>
        <p className="text-muted-foreground">Customize the interview parameters to tailor the questions and scoring system.</p>
      </div>

      <Card className="border-primary/20 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Sparkles className="w-5 h-5 mr-2 text-primary" />
              Session Configuration
            </CardTitle>
            <CardDescription>We will simulate a realistic interview experience based on these parameters.</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="role-input">Target Job Role</Label>
              <Input
                id="role-input"
                type="text"
                placeholder="e.g. Frontend Developer, Data Scientist"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="focus-visible:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company-input">Target Company</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="company-input"
                    type="text"
                    placeholder="e.g. Google, Stripe (or Generic)"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="pl-9 focus-visible:ring-primary"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Experience Level</Label>
                <div className="grid grid-cols-4 gap-2">
                  {["Junior", "Mid", "Senior", "Lead"].map((lvl) => (
                    <Button
                      key={lvl}
                      type="button"
                      variant={level === lvl ? "default" : "outline"}
                      onClick={() => setLevel(lvl)}
                      className="text-xs h-10 px-0"
                    >
                      {lvl}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Interview Mode</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: "full-mock", name: "Full Mock", desc: "Adaptive mix of technical, behavioral, and resume questions." },
                  { id: "technical", name: "Technical Depth", desc: "Focus strictly on technical skills and problem solving." },
                  { id: "behavioral", name: "Behavioral", desc: "Focus on STAR situations and leadership principles." },
                  { id: "resume-based", name: "Resume & Projects", desc: "Focus on experience and projects in your resume." },
                ].map((m) => (
                  <div
                    key={m.id}
                    onClick={() => setMode(m.id)}
                    className={`cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col space-y-1 ${
                      mode === m.id
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <span className="font-semibold text-sm">{m.name}</span>
                    <span className="text-xs text-muted-foreground leading-normal">{m.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all mt-4">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating Session Questions...
                </>
              ) : (
                <>
                  <Flame className="w-5 h-5 mr-2" />
                  Start Mock Interview
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
