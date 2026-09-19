import { afterEach, describe, expect, it } from 'vitest'
import { answerEvaluationSchema, evaluationInput } from '../../../api/_lib/evaluation'
import { createSessionToken, isAuthorized } from '../../../api/_lib/auth'
import type { VercelRequest } from '@vercel/node'

const validEvaluation = {
  overallScore: 80,
  dimensions: Object.fromEntries(
    ['relevance', 'structure', 'specificity', 'ownership', 'judgment', 'clarity'].map((name) => [
      name,
      { score: 4, justification: `${name} is strong.` },
    ]),
  ),
  strengths: ['Clear decision'],
  missingBeats: [],
  priorityImprovement: 'Quantify the result.',
  improvedOutline: ['Context', 'Action', 'Result'],
  followUpQuestion: 'What tradeoff did you make?',
}
afterEach(() => delete process.env.SESSION_SECRET)

describe('server contracts', () => {
  it('accepts the complete grading shape and rejects an out-of-range score', () => {
    expect(answerEvaluationSchema.parse(validEvaluation).overallScore).toBe(80)
    expect(() => answerEvaluationSchema.parse({ ...validEvaluation, overallScore: 101 })).toThrow(
      /Too big/,
    )
  })
  it('builds a question-specific grading payload', () => {
    const input = evaluationInput({
      question: 'Tell me about yourself.',
      expectedBeats: ['Career arc', 'Role fit'],
      followUp: 'What changed?',
      transcript: 'My answer.',
      durationSeconds: 45,
    })
    expect(input).toContain('Career arc')
    expect(input).toContain('45 seconds')
    expect(input).toContain('My answer.')
  })
  it('accepts a valid signed session and rejects tampering', () => {
    process.env.SESSION_SECRET = 'a-test-secret-that-is-long-enough'
    const token = createSessionToken()
    expect(
      isAuthorized({ headers: { cookie: `interview_session=${token}` } } as VercelRequest),
    ).toBe(true)
    expect(
      isAuthorized({ headers: { cookie: `interview_session=${token}x` } } as VercelRequest),
    ).toBe(false)
  })
})
