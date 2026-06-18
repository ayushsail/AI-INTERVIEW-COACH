import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";
import pdf from "pdf-parse";
import dbConnect from "@/lib/mongodb";
import Resume from "@/models/Resume";
import { parseResumeWithAI } from "@/lib/parsers/resumeParser";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { resumeId } = body;

    if (!resumeId) {
      return NextResponse.json({ error: "Missing resumeId" }, { status: 400 });
    }

    await dbConnect();
    const resume = await Resume.findById(resumeId);

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (resume.parsedAt && resume.parsedData) {
      // Already parsed
      return NextResponse.json({ success: true, data: resume.parsedData });
    }

    // Read the file from disk
    const uploadDir = join(process.cwd(), "public");
    const filePath = join(uploadDir, resume.fileUrl); // fileUrl is like /uploads/123.pdf

    const fileBuffer = await readFile(filePath);

    // Parse PDF to raw text
    const pdfData = await pdf(fileBuffer);
    const rawText = pdfData.text;

    if (!rawText || rawText.trim() === "") {
        return NextResponse.json({ error: "Could not extract text from PDF. It might be scanned/image-based." }, { status: 400 });
    }

    // Update DB with raw text
    resume.rawText = rawText;
    await resume.save();

    // Send to AI Parser
    const parsedData = await parseResumeWithAI(rawText);

    // Save final structured data to DB
    resume.parsedData = parsedData;
    resume.parsedAt = new Date();
    await resume.save();

    return NextResponse.json({ success: true, data: parsedData });
  } catch (error: any) {
    console.error("Resume parsing route error:", error);
    return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 });
  }
}
