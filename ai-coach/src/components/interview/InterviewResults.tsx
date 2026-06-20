"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, ChevronDown, ChevronUp, AlertTriangle, CheckCircle, RefreshCw, BarChart2 } from "lucide-react";

interface InterviewResultsProps {
  sessionId: string;
  answers: Array<{
    question: string;
    answerText: string;
    scoreTechnical: number;
    scoreCommunication: number;
    scoreConfidence: number;
    scoreStructure: number;
    scoreRelevance: number;
    feedback: string;
    weaknessTags: string[];
    mistakes?: string[];
  }>;
  onGenerateStudyPlan: () => void;
  isGeneratingPlan: boolean;
  hasStudyPlan: boolean;
}

export default function InterviewResults({
  sessionId,
  answers,
  onGenerateStudyPlan,
  isGeneratingPlan,
  hasStudyPlan,
}: InterviewResultsProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  // Compute averages
  const count = answers.length;
  const avgTech = answers.reduce((acc, a) => acc + a.scoreTechnical, 0) / count;
  const avgComm = answers.reduce((acc, a) => acc + a.scoreCommunication, 0) / count;
  const avgConf = answers.reduce((acc, a) => acc + a.scoreConfidence, 0) / count;
  const avgStruct = answers.reduce((acc, a) => acc + a.scoreStructure, 0) / count;
  const avgRel = answers.reduce((acc, a) => acc + a.scoreRelevance, 0) / count;

  const overallAvg = (avgTech + avgComm + avgConf + avgStruct + avgRel) / 5;

  // Gather unique weakness tags
  const weaknessesSet = new Set<string>();
  answers.forEach((a) => a.weaknessTags?.forEach((t) => weaknessesSet.add(t)));
  const weaknesses = Array.from(weaknessesSet);

  const getScoreColor = (score: number) => {
    if (score >= 8) return "text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20";
    if (score >= 6) return "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-destructive bg-destructive/10 border-destructive/20";
  };

  const getOverallGrade = (score: number) => {
    if (score >= 8.5) return { grade: "Strong Pass", color: "text-green-600 dark:text-green-400" };
    if (score >= 7.0) return { grade: "Pass with Feedback", color: "text-amber-600 dark:text-amber-400" };
    return { grade: "Needs Practice", color: "text-destructive" };
  };

  const gradeInfo = getOverallGrade(overallAvg);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Session Title */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Interview Performance Report</h2>
        <p className="text-muted-foreground mt-1">Review your overall metrics, detailed question analysis, and custom study roadmap.</p>
      </div>

      {/* Main Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="col-span-1 border-primary/20 bg-primary/5 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Overall Score</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pb-6">
            <div className="flex items-baseline space-x-2">
              <span className="text-5xl font-black">{overallAvg.toFixed(1)}</span>
              <span className="text-muted-foreground text-sm">/ 10</span>
            </div>
            <div className="space-y-1">
              <span className={`text-sm font-bold ${gradeInfo.color}`}>{gradeInfo.grade}</span>
              <p className="text-xs text-muted-foreground">Average of technical, communication, confidence, structure, and relevance scores.</p>
            </div>
          </CardContent>
        </Card>

        {/* Score Breakdown Cards */}
        <Card className="col-span-1 md:col-span-2 border-muted shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-primary" />
              Dimensions Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Technical Depth", score: avgTech, color: "bg-blue-500" },
              { label: "Communication Clarity", score: avgComm, color: "bg-indigo-500" },
              { label: "Confidence", score: avgConf, color: "bg-amber-500" },
              { label: "Structure", score: avgStruct, color: "bg-teal-500" },
              { label: "Relevance", score: avgRel, color: "bg-purple-500" },
            ].map((dim) => (
              <div key={dim.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span>{dim.label}</span>
                  <span>{dim.score.toFixed(1)} / 10</span>
                </div>
                <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                  <div className={`${dim.color} h-full`} style={{ width: `${dim.score * 10}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Weakness Areas Detected */}
      {weaknesses.length > 0 && (
        <Card className="border-amber-500/25 bg-amber-500/5">
          <CardContent className="pt-6 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <h4 className="font-semibold text-sm text-amber-800 dark:text-amber-300">Areas For Improvement</h4>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
                The evaluation engine detected consistent gaps in the following topics. Generating a study plan will address these specifically.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                {weaknesses.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Question Analysis Title */}
      <div>
        <h3 className="text-lg font-bold">Detailed Question Analysis</h3>
        <p className="text-xs text-muted-foreground mt-1">Review feedback, scoring details, and mistakes for each answer.</p>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-4">
        {answers.map((ans, idx) => {
          const isExpanded = expandedIndex === idx;
          const questionScore = (ans.scoreTechnical + ans.scoreCommunication + ans.scoreConfidence + ans.scoreStructure + ans.scoreRelevance) / 5;

          return (
            <Card key={idx} className="border-muted shadow-sm overflow-hidden">
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-colors gap-4"
              >
                <div className="flex items-start space-x-3 overflow-hidden">
                  <div className="bg-muted p-1.5 rounded-md text-xs font-bold text-muted-foreground shrink-0 mt-1">
                    Q{idx + 1}
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm truncate">{ans.question}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Your score: {questionScore.toFixed(1)} / 10</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 shrink-0">
                  <span className={`text-xs border font-medium px-2 py-0.5 rounded-full ${getScoreColor(questionScore)}`}>
                    {questionScore >= 8 ? "Excellent" : questionScore >= 6 ? "Good" : "Needs Review"}
                  </span>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                </div>
              </div>

              {isExpanded && (
                <CardContent className="border-t bg-muted/10 p-5 space-y-4 text-sm leading-relaxed animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Your Answer</span>
                    <p className="bg-background border rounded-lg p-3 text-xs text-muted-foreground leading-relaxed italic">
                      "{ans.answerText}"
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Scoring Breakdown</span>
                    <div className="flex flex-wrap gap-4 pt-1">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Technical</p>
                        <p className="font-bold">{ans.scoreTechnical}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Communication</p>
                        <p className="font-bold">{ans.scoreCommunication}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="font-bold">{ans.scoreConfidence}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Structure</p>
                        <p className="font-bold">{ans.scoreStructure}/10</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Relevance</p>
                        <p className="font-bold">{ans.scoreRelevance}/10</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Evaluation & Advice</span>
                    <p className="text-xs leading-relaxed text-muted-foreground/90 whitespace-pre-line">{ans.feedback}</p>
                  </div>

                  {ans.mistakes && ans.mistakes.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Identified Misconceptions</span>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-destructive">
                        {ans.mistakes.map((mis, mIdx) => (
                          <li key={mIdx}>{mis}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ans.weaknessTags && ans.weaknessTags.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Topics Tagged</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {ans.weaknessTags.map((t) => (
                          <span key={t} className="inline-flex px-2 py-0.5 bg-muted rounded text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Action CTA Box */}
      <Card className="border-primary bg-primary/5 text-center p-8 rounded-2xl flex flex-col items-center justify-center space-y-4">
        <BookOpen className="w-10 h-10 text-primary" />
        <div className="space-y-1 max-w-md">
          <h4 className="text-lg font-bold">Personalized Study Planner</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Let Gemini AI synthesize all of your scores, mistakes, and weakness tags into a comprehensive roadmap of actionable tasks and estimation timelines.
          </p>
        </div>
        
        <Button
          onClick={onGenerateStudyPlan}
          disabled={isGeneratingPlan}
          className="px-6 py-5 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
        >
          {isGeneratingPlan ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Synthesizing Plan...
            </>
          ) : hasStudyPlan ? (
            "View Study Plan"
          ) : (
            "Generate Study Plan"
          )}
        </Button>
      </Card>
    </div>
  );
}
