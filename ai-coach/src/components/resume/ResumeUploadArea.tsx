"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function ResumeUploadArea() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    setUploadStatus("idle");
    setErrorMessage("");

    if (selectedFile.type !== "application/pdf") {
      setErrorMessage("Please upload a valid PDF file.");
      return;
    }
    if (selectedFile.size > 5 * 1024 * 1024) {
      setErrorMessage("File size must be under 5MB.");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadStatus("idle");

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to upload resume.");
      }

      setUploadStatus("success");
      setFile(null);
    } catch (err: any) {
      console.error(err);
      setUploadStatus("error");
      setErrorMessage(err.message || "An error occurred during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all ${
          isDragging ? "border-primary bg-primary/10" : "border-border hover:bg-muted/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <UploadCloud className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-1">Drag and drop your resume</h3>
        <p className="text-sm text-muted-foreground mb-4">PDF format only, max 5MB</p>
        
        <input 
          type="file" 
          id="resume-upload" 
          className="hidden" 
          accept="application/pdf"
          onChange={handleFileChange}
        />
        <Button variant="outline" onClick={() => document.getElementById("resume-upload")?.click()}>
          Browse Files
        </Button>
      </div>

      {file && uploadStatus !== "success" && (
        <div className="bg-background rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between border shadow-sm gap-4">
          <div className="flex items-center space-x-3 overflow-hidden">
            <FileText className="w-8 h-8 text-primary shrink-0" />
            <div className="truncate">
              <p className="text-sm font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          <Button onClick={handleUpload} disabled={isUploading} className="shrink-0 w-full sm:w-auto">
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Start Session"
            )}
          </Button>
        </div>
      )}

      {uploadStatus === "error" && (
        <div className="bg-destructive/10 text-destructive rounded-lg p-3 flex items-center text-sm border border-destructive/20">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          {errorMessage}
        </div>
      )}

      {uploadStatus === "success" && (
        <div className="bg-green-500/10 text-green-600 dark:text-green-400 rounded-lg p-3 flex items-center text-sm border border-green-500/20">
          <CheckCircle2 className="w-4 h-4 mr-2 shrink-0" />
          Resume uploaded successfully! Ready to start parsing.
        </div>
      )}
    </div>
  );
}
