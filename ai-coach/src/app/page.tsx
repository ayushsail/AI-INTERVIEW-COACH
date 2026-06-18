import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import ResumeUploadArea from "@/components/resume/ResumeUploadArea";

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
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
            <ResumeUploadArea />
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
  );
}
