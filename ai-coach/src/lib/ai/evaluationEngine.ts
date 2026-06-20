import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const EvaluationResultSchema = z.object({
  scoreTechnical: z.number().min(0).max(10).describe("Technical depth and accuracy score out of 10."),
  scoreCommunication: z.number().min(0).max(10).describe("Communication clarity, explanation structure, and tone score out of 10."),
  scoreConfidence: z.number().min(0).max(10).describe("Confidence, pace, and presentation score out of 10."),
  scoreStructure: z.number().min(0).max(10).describe("Answer structuring (e.g. STAR method, clear intro/body/conclusion) score out of 10."),
  scoreRelevance: z.number().min(0).max(10).describe("Relevance and directly answering the question score out of 10."),
  feedbackStrong: z.string().describe("What the candidate did well in this answer."),
  feedbackWeak: z.string().describe("Where the candidate struggled or fell short in this answer."),
  feedbackImprovement: z.string().describe("Specific guidance on how to improve this response next time."),
  mistakes: z.array(z.string()).describe("List of concrete errors, misconceptions, or omissions in the answer."),
  weaknessTags: z.array(z.string()).describe("Generic topics or technology tags representing the weakness (e.g., 'React Hooks', 'Database Sharding', 'STAR Method'). Use 1-3 word noun tags."),
  examplePracticeTopic: z.string().describe("A related practice topic for follow-up study."),
});

interface EvaluateAnswerParams {
  question: string;
  expectedSignals: string[];
  userAnswer: string;
  candidateProfile: any; // parsedData from Resume
}

export async function evaluateUserAnswer(params: EvaluateAnswerParams) {
  const { question, expectedSignals, userAnswer, candidateProfile } = params;

  const prompt = `
    You are an expert technical interviewer and communication coach.
    Please evaluate the candidate's answer to the following interview question:
    
    - **Question**: "${question}"
    - **Expected Good Signals**: ${JSON.stringify(expectedSignals)}
    - **User Answer**: "${userAnswer}"
    
    Candidate Profile (for context on their experience level and projects):
    ${JSON.stringify(candidateProfile, null, 2)}

    Evaluate the answer across the following dimensions (each out of 10):
    1. **Technical Depth**: Accurate concepts, depth of knowledge, tools.
    2. **Communication Clarity**: Professional tone, speaking pace, clear vocabulary.
    3. **Confidence**: Self-assuredness, lack of excessive hesitation or rambling.
    4. **Structure**: Logical order (e.g., Situation-Task-Action-Result for behavioral, Problem-Solution for technical).
    5. **Relevance**: Does the response directly address the question without excessive fluff?

    Output the result strictly following the JSON schema, providing rich, constructive written feedback, identifying specific mistakes or missing points, and tagging weakness topics.
  `;

  try {
    const result = await generateObject({
      model: google('gemini-2.5-flash'),
      schema: EvaluationResultSchema,
      prompt: prompt,
    });

    return result.object;
  } catch (error) {
    console.error('Error in answer evaluation:', error);
    throw new Error('Failed to evaluate answer');
  }
}
