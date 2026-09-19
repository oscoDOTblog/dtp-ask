import type {
  AnswerEvaluation,
  Attempt,
  Confidence,
  PracticeState,
  SelfReview,
} from '@/types/interview'

export const STORAGE_KEY = 'interview-room.practice.v1'

export const emptyPracticeState = (): PracticeState => ({
  attempts: [],
  selfReviews: [],
  lastCategory: 'mixed',
})

export function loadPracticeState(storage: Storage = localStorage): PracticeState {
  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return emptyPracticeState()
    const parsed = JSON.parse(raw) as Partial<PracticeState>
    return {
      attempts: Array.isArray(parsed.attempts) ? parsed.attempts.filter(isAttempt) : [],
      selfReviews: Array.isArray(parsed.selfReviews) ? parsed.selfReviews.filter(isSelfReview) : [],
      lastCategory:
        typeof parsed.lastCategory === 'string'
          ? parsed.lastCategory
          : emptyPracticeState().lastCategory,
    } as PracticeState
  } catch {
    return emptyPracticeState()
  }
}

export function savePracticeState(state: PracticeState, storage: Storage = localStorage) {
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Private browsing and full storage quotas should not block practice.
  }
}

export function wordsPerMinute(transcript: string, durationSeconds: number) {
  if (durationSeconds <= 0) return 0
  const words = transcript.trim().split(/\s+/).filter(Boolean).length
  return Math.round((words / durationSeconds) * 60)
}

export function pacingNote(wpm: number) {
  if (!wpm) return 'Pace unavailable'
  if (wpm < 105) return 'Measured pace — leave fewer pauses on the next pass.'
  if (wpm > 175) return 'Fast pace — give the important decisions more room.'
  return 'Conversational pace — easy to follow.'
}

export function latestAttemptFor(attempts: Attempt[], cardId: string) {
  return attempts.find((attempt) => attempt.cardId === cardId)
}

export function weakCardIds(attempts: Attempt[]) {
  const latest = new Map<string, Attempt>()
  for (const attempt of attempts) {
    if (!latest.has(attempt.cardId)) latest.set(attempt.cardId, attempt)
  }
  return [...latest.values()]
    .filter(
      (attempt) => attempt.confidence === 'needs-work' || attempt.evaluation.overallScore < 70,
    )
    .map((attempt) => attempt.cardId)
}

export function weakSelfReviewCardIds(reviews: SelfReview[]) {
  const latest = new Map<string, SelfReview>()
  for (const review of reviews) {
    if (!latest.has(review.cardId)) latest.set(review.cardId, review)
  }
  return [...latest.values()]
    .filter((review) => review.confidence === 'needs-work')
    .map((review) => review.cardId)
}

export function withConfidence(attempts: Attempt[], attemptId: string, confidence: Confidence) {
  return attempts.map((attempt) =>
    attempt.id === attemptId ? { ...attempt, confidence } : attempt,
  )
}

export function isEvaluation(value: unknown): value is AnswerEvaluation {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<AnswerEvaluation>
  return (
    typeof candidate.overallScore === 'number' &&
    !!candidate.dimensions &&
    Array.isArray(candidate.strengths) &&
    Array.isArray(candidate.missingBeats) &&
    typeof candidate.priorityImprovement === 'string' &&
    Array.isArray(candidate.improvedOutline) &&
    typeof candidate.followUpQuestion === 'string'
  )
}

function isAttempt(value: unknown): value is Attempt {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<Attempt>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.cardId === 'string' &&
    typeof candidate.transcript === 'string' &&
    isEvaluation(candidate.evaluation)
  )
}

function isSelfReview(value: unknown): value is SelfReview {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<SelfReview>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.cardId === 'string' &&
    typeof candidate.createdAt === 'string' &&
    typeof candidate.durationSeconds === 'number'
  )
}
