import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const GeneratedQuestionSchema = z.object({
  question: z.string().describe("The text of the interview question to ask the user next."),
  category: z.enum(['behavioral', 'technical', 'resume-based', 'project-based', 'role-specific', 'weakness-followup']).describe("The category of the question."),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe("The difficulty level of the question."),
  whyItMatters: z.string().describe("Explanation of why this question is being asked and what it measures."),
  expectedSignals: z.array(z.string()).describe("Key concepts, answers, or behaviors expected in a good response."),
});

interface GenerateQuestionParams {
  resumeSummary: any; // parsedData from Resume
  targetRole: string;
  experienceLevel: string;
  company?: string;
  mode?: string;
  previousQuestions: Array<{ question: string; category: string }>;
  previousAnswers: Array<{ answerText: string; weaknessTags: string[] }>;
}

export async function generateNextQuestion(params: GenerateQuestionParams) {
  const {
    resumeSummary,
    targetRole,
    experienceLevel,
    company = 'Generic',
    mode = 'full-mock',
    previousQuestions,
    previousAnswers,
  } = params;

  // Determine stage based on count of previous questions
  const qCount = previousQuestions.length;
  let targetCategory: 'behavioral' | 'technical' | 'resume-based' | 'project-based' | 'role-specific' | 'weakness-followup' = 'resume-based';

  // Rule-based flow mapping (assuming a 5-question mock interview session):
  if (mode === 'behavioral') {
    targetCategory = 'behavioral';
  } else if (mode === 'technical') {
    if (qCount === 0 || qCount === 1) targetCategory = 'technical';
    else if (qCount === 2 || qCount === 3) targetCategory = 'role-specific';
    else targetCategory = 'weakness-followup';
  } else if (mode === 'resume-based') {
    if (qCount === 0 || qCount === 1) targetCategory = 'resume-based';
    else if (qCount === 2 || qCount === 3) targetCategory = 'project-based';
    else targetCategory = 'weakness-followup';
  } else {
    // 'full-mock' - standard progression
    if (qCount === 0) {
      targetCategory = 'resume-based';
    } else if (qCount === 1) {
      targetCategory = 'project-based';
    } else if (qCount === 2) {
      targetCategory = 'role-specific';
    } else if (qCount === 3) {
      targetCategory = 'behavioral';
    } else {
      targetCategory = 'weakness-followup';
    }
  }

  // Gather previous weaknesses if any exist
  const previousWeaknesses = previousAnswers
    .flatMap(a => a.weaknessTags || [])
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  const prompt = `
    You are an expert recruiter and technical interviewer conducting a mock interview for the following role:
    - **Target Role**: ${targetRole}
    - **Target Company**: ${company}
    - **Experience Level**: ${experienceLevel}
    - **Interview Mode**: ${mode}

    Here is the structured summary of the candidate's Resume/Profile:
    ${JSON.stringify(resumeSummary, null, 2)}

    Current Session Progress:
    - Questions asked so far: ${qCount}
    - Previous Questions: ${JSON.stringify(previousQuestions.map(q => q.question))}
    - Previous identified weaknesses (tags): ${JSON.stringify(previousWeaknesses)}

    Instructions for generating the next question:
    1. The target category for this question MUST be: **${targetCategory}**.
    2. If the category is "resume-based" or "project-based", focus on details mentioned in the candidate's profile (like their projects, education, or work history).
    3. If the category is "technical" or "role-specific", ask a concept or practical problem relevant to a ${experienceLevel} level ${targetRole} at ${company}.
    4. If the category is "behavioral", ask a situation-based question (STAR method) relevant to professional experiences.
    5. If the category is "weakness-followup", construct a question targeting one of their previous weaknesses (${JSON.stringify(previousWeaknesses)}) to see if they can clarify or expand on it.
    6. Ensure the question feels natural, professional, and adapts to the candidate's background. Avoid asking questions that are identical or highly similar to previous ones.
  `;

  try {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: GeneratedQuestionSchema,
      prompt: prompt,
    });

    return result.object;
  } catch (error) {
    console.error('Error generating question:', error);
    throw new Error('Failed to generate next interview question');
  }
}
