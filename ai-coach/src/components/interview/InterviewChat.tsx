"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Mic, MicOff, Send, Timer, HelpCircle, CheckCircle, Award } from "lucide-react";

interface InterviewChatProps {
  question: {
    questionId: string;
    question: string;
    category: string;
    difficulty: string;
    expectedSignals?: string[];
  };
  qNum: number;
  totalQ?: number;
  onSendAnswer: (answerText: string) => void;
  isSending: boolean;
}

export default function InterviewChat({ question, qNum, totalQ = 5, onSendAnswer, isSending }: InterviewChatProps) {
  const [answerText, setAnswerText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const recognitionRef = useRef<any>(null);

  // Timer countdown
  useEffect(() => {
    setTimeLeft(120);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [question.questionId]);

  // Voice Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = true;
        rec.interimResults = true;
        rec.lang = "en-US";

        rec.onresult = (e: any) => {
          let transcript = "";
          for (let i = e.resultIndex; i < e.results.length; i++) {
            transcript += e.results[i][0].transcript;
          }
          setAnswerText((prev) => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${transcript}` : transcript;
          });
        };

        rec.onerror = (e: any) => {
          console.error("Speech recognition error:", e);
          setIsRecording(false);
        };

        rec.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = rec;
      }
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = () => {
    if (!answerText.trim() || isSending) return;
    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onSendAnswer(answerText.trim());
    setAnswerText("");
  };

  const progressPercent = Math.round(((qNum - 1) / totalQ) * 100);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b pb-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full">
            Question {qNum} of {totalQ}
          </span>
          <h2 className="text-xl font-bold mt-2">Active Session</h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-muted-foreground bg-muted px-3 py-1.5 rounded-lg text-sm">
            <Timer className={`w-4 h-4 ${timeLeft < 30 ? "text-destructive animate-pulse" : ""}`} />
            <span className={`font-mono font-medium ${timeLeft < 30 ? "text-destructive" : ""}`}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <span className="text-xs text-muted-foreground font-medium bg-muted/50 px-2.5 py-1.5 rounded-md">
            Difficulty: {question.difficulty}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
        <div 
          className="bg-primary h-full transition-all duration-500 ease-out" 
          style={{ width: `${progressPercent}%` }} 
        />
      </div>

      {/* Question Card */}
      <Card className="border-l-4 border-l-primary shadow-sm">
        <CardContent className="pt-6 flex items-start space-x-4">
          <div className="bg-primary/10 p-2.5 rounded-xl shrink-0">
            <HelpCircle className="w-6 h-6 text-primary" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
              {question.category.replace("-", " ")}
            </span>
            <p className="text-lg font-medium leading-relaxed">{question.question}</p>
          </div>
        </CardContent>
      </Card>

      {/* User Response Area */}
      <div className="space-y-4">
        <div className="relative">
          <textarea
            className="w-full min-h-[180px] rounded-xl border border-input bg-background p-4 text-sm shadow-inner focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 resize-y leading-relaxed"
            placeholder="Type your response here or click the microphone to speak..."
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            disabled={isSending}
          />
          
          <div className="absolute right-3 bottom-3 flex items-center space-x-2">
            <Button
              type="button"
              variant={isRecording ? "destructive" : "outline"}
              size="icon"
              onClick={toggleRecording}
              disabled={isSending}
              className="rounded-full h-10 w-10 shadow-sm"
              title={isRecording ? "Stop recording" : "Record voice answer"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
          <span>Words: {answerText.trim() ? answerText.trim().split(/\s+/).length : 0} | Characters: {answerText.length}</span>
          <span>Press Enter to type, click Submit when ready.</span>
        </div>

        <div className="flex justify-end pt-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isSending || !answerText.trim()}
            className="px-6 py-5 shadow-md hover:shadow-lg transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing Answer...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Answer
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
