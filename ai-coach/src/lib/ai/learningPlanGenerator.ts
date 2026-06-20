import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const StudyPlanResultSchema = z.object({
  focusAreas: z.array(z.string()).describe("List of high-level focus areas (e.g. 'Asynchronous JavaScript', 'System Design Scaling')."),
  tasks: z.array(
    z.object({
      topic: z.string().describe("A specific subject or concept (e.g. 'Redis Caching')."),
      task: z.string().describe("An actionable study task or practice exercise (e.g. 'Implement a simple rate limiter using Redis')."),
      priority: z.enum(['High', 'Medium', 'Low']).describe("Priority level based on how critical it is for the target role."),
      estimatedTime: z.string().describe("Estimated time to complete this study task (e.g., '2 hours', '1 day')."),
    })
  ).describe("Actionable study plan tasks to address weaknesses."),
});

interface GenerateLearningPlanParams {
  weaknessTags: string[];
  interviewScores: {
    technical: number;
    communication: number;
    confidence: number;
    structure: number;
    relevance: number;
  };
  targetRole: string;
}

export async function generateLearningPlan(params: GenerateLearningPlanParams) {
  const { weaknessTags, interviewScores, targetRole } = params;

  const prompt = `
    You are an expert career coach and technical mentor. 
    Construct a personalized, structured learning roadmap for a candidate who completed a mock interview for the role of **${targetRole}**.
    
    Here is the summary of their performance:
    - **Weakness Topics Identified**: ${JSON.stringify(weaknessTags)}
    - **Interview Category Scores (Out of 10)**:
      - Technical Depth: ${interviewScores.technical}
      - Communication Clarity: ${interviewScores.communication}
      - Confidence: ${interviewScores.confidence}
      - Structure: ${interviewScores.structure}
      - Relevance: ${interviewScores.relevance}
      
    Instructions:
    1. Focus heavily on addressing the identified weaknesses, particularly if the Technical Depth score is low (< 7).
    2. Provide broad "Focus Areas" (e.g. 2-4 items) and a list of specific, highly actionable "Tasks".
    3. Each task must specify a topic, concrete practice task, priority (High/Medium/Low), and a realistic estimated time to finish.
    4. Ensure tasks are tailored specifically to the ${targetRole} stack (e.g., frontend-related tasks for front-end developers, system architecture for backend, etc.).
  `;

  try {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: StudyPlanResultSchema,
      prompt: prompt,
    });

    return result.object;
  } catch (error) {
    console.error('Error generating learning plan:', error);
    throw new Error('Failed to generate learning plan');
  }
}
