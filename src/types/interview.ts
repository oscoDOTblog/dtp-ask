export const categoryIds = [
  'story',
  'product',
  'collaboration',
  'reliability',
  'architecture',
  'team-fit',
] as const

export type CategoryId = (typeof categoryIds)[number]
export type Confidence = 'needs-work' | 'getting-there' | 'ready'
export type DimensionId =
  'relevance' | 'structure' | 'specificity' | 'ownership' | 'judgment' | 'clarity'

export interface Category {
  id: CategoryId
  name: string
  shortName: string
  description: string
  accent: string
}

export interface InterviewCard {
  id: string
  category: CategoryId
  question: string
  suggestedSeconds: number
  keyBeats: string[]
  sampleResponse: string
  followUp: string
  placeholders?: string[]
}

export interface RubricScore {
  score: number
  justification: string
}

export interface AnswerEvaluation {
  overallScore: number
  dimensions: Record<DimensionId, RubricScore>
  strengths: string[]
  missingBeats: string[]
  priorityImprovement: string
  improvedOutline: string[]
  followUpQuestion: string
}

export interface Attempt {
  id: string
  cardId: string
  createdAt: string
  transcript: string
  durationSeconds: number
  wordsPerMinute: number
  confidence?: Confidence
  evaluation: AnswerEvaluation
}

export interface SelfReview {
  id: string
  cardId: string
  createdAt: string
  durationSeconds: number
  confidence?: Confidence
}

export interface PracticeState {
  attempts: Attempt[]
  selfReviews: SelfReview[]
  lastCategory: CategoryId | 'mixed'
}
