import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const resumeSchema = z.object({
  skills: z.array(z.string()).describe("List of technical and soft skills."),
  projects: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      technologies: z.array(z.string()),
    })
  ).describe("Key projects worked on by the candidate."),
  experience: z.array(
    z.object({
      role: z.string(),
      company: z.string(),
      duration: z.string(),
      description: z.string(),
    })
  ).describe("Professional work experience."),
  education: z.array(
    z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.string(),
    })
  ).describe("Educational background."),
  toolsAndTech: z.array(z.string()).describe("Software, tools, or frameworks the candidate is proficient in."),
  targetRoleHints: z.string().describe("Based on the resume, what roles would this candidate be a good fit for?"),
});

export async function parseResumeWithAI(rawText: string) {
  try {
    const result = await generateObject({
      model: google('gemini-2.5-flash'), // or gemini-2.0-flash depending on exact sdk availability, using 2.5-flash which is widely used or 1.5-flash.
      schema: resumeSchema,
      prompt: `You are an expert technical recruiter and AI resume parser. 
      Please extract the candidate's structured information from the following raw resume text.
      Be precise, fix any obvious OCR errors, and strictly follow the JSON schema.
      
      Raw Resume Text:
      ${rawText}
      `,
    });

    return result.object;
  } catch (error) {
    console.error("AI Parsing Error:", error);
    throw new Error("Failed to parse resume with AI");
  }
}
