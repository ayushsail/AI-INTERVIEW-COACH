import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import dbConnect from "@/lib/mongodb";
import Resume from "@/models/Resume";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are supported" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save to public/uploads
    const uploadDir = join(process.cwd(), "public/uploads");
    
    // Ensure the directory exists
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Directory already exists or cannot be created
    }

    // Generate unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
    const filePath = join(uploadDir, uniqueFilename);
    const fileUrl = `/uploads/${uniqueFilename}`;

    await writeFile(filePath, buffer);

    // Save to MongoDB
    await dbConnect();
    
    const newResume = await Resume.create({
      fileUrl: fileUrl,
      userId: "guest", // Placeholder until auth is added
    });

    return NextResponse.json({ success: true, resumeId: newResume._id, fileUrl });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Internal server error during upload." },
      { status: 500 }
    );
  }
}
