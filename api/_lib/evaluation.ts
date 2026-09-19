import { z } from 'zod'

const rubricScoreSchema = z.object({
  score: z.number().int().min(1).max(5),
  justification: z.string().min(1).max(280),
})

export const answerEvaluationSchema = z.object({
  overallScore: z.number().int().min(0).max(100),
  dimensions: z.object({
    relevance: rubricScoreSchema,
    structure: rubricScoreSchema,
    specificity: rubricScoreSchema,
    ownership: rubricScoreSchema,
    judgment: rubricScoreSchema,
    clarity: rubricScoreSchema,
  }),
  strengths: z.array(z.string().min(1).max(240)).min(1).max(3),
  missingBeats: z.array(z.string().min(1).max(240)).max(4),
  priorityImprovement: z.string().min(1).max(400),
  improvedOutline: z.array(z.string().min(1).max(240)).min(2).max(5),
  followUpQuestion: z.string().min(1).max(280),
})

export type ServerEvaluation = z.infer<typeof answerEvaluationSchema>

export const evaluationInstructions = `You are a rigorous, encouraging interview coach for a senior full-stack engineering candidate.

Evaluate only the supplied transcript against the question and expected beats. Do not reward matching a sample answer's wording. Do not invent facts, penalize an answer for refusing to reveal confidential information, or claim to assess vocal confidence, tone, pronunciation, or body language.

Use these anchors for each 1–5 score:
1 = absent or actively undermines the answer
2 = partially present but vague or difficult to follow
3 = credible baseline with meaningful gaps
4 = strong, specific, and interview-ready
5 = exceptional evidence, judgment, and clarity

Compute overallScore as a weighted score out of 100: relevance 20%, structure 15%, specificity 20%, ownership 15%, judgment 20%, clarity 10%. Keep feedback direct, practical, and grounded in exact details from the transcript. Lead with real strengths, identify missing expected beats, and give one highest-leverage improvement. The improved outline must be beats, not a replacement script.`

export function evaluationInput(input: {
  question: string
  expectedBeats: string[]
  followUp: string
  transcript: string
  durationSeconds: number
}) {
  return `QUESTION\n${input.question}\n\nEXPECTED STORY BEATS\n${input.expectedBeats
    .map((beat) => `- ${beat}`)
    .join(
      '\n',
    )}\n\nPLANNED FOLLOW-UP\n${input.followUp}\n\nANSWER DURATION\n${input.durationSeconds} seconds\n\nTRANSCRIPT\n${input.transcript}`
}
