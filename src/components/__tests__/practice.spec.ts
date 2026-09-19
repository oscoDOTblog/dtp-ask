import { beforeEach, describe, expect, it } from 'vitest'
import { categories, interviewCards } from '@/data/deck'
import {
  emptyPracticeState,
  loadPracticeState,
  pacingNote,
  savePracticeState,
  weakCardIds,
  weakSelfReviewCardIds,
  wordsPerMinute,
} from '@/services/practice'
import type { Attempt } from '@/types/interview'

const evaluation = {
  overallScore: 64,
  dimensions: {
    relevance: { score: 4, justification: 'Direct.' },
    structure: { score: 3, justification: 'Mostly ordered.' },
    specificity: { score: 2, justification: 'Needs evidence.' },
    ownership: { score: 3, justification: 'Some ownership.' },
    judgment: { score: 3, justification: 'Tradeoffs mentioned.' },
    clarity: { score: 4, justification: 'Clear.' },
  },
  strengths: ['Direct opening'],
  missingBeats: ['Concrete result'],
  priorityImprovement: 'Add one measurable outcome.',
  improvedOutline: ['Context', 'Decision', 'Result'],
  followUpQuestion: 'What changed?',
}
const attempt: Attempt = {
  id: 'attempt-1',
  cardId: interviewCards[0]!.id,
  createdAt: '2026-09-18T00:00:00.000Z',
  transcript: 'A concise answer with enough words to measure pace.',
  durationSeconds: 60,
  wordsPerMinute: 9,
  confidence: 'needs-work',
  evaluation,
}

describe('practice state', () => {
  beforeEach(() => localStorage.clear())
  it('contains seven categories and eighty uniquely identified questions', () => {
    expect(categories).toHaveLength(7)
    expect(interviewCards).toHaveLength(80)
    expect(new Set(interviewCards.map((card) => card.id)).size).toBe(80)
    expect(
      interviewCards.filter((card) => card.category === 'technical-fundamentals'),
    ).toHaveLength(60)
    expect(new Set(interviewCards.map((card) => card.category)).size).toBe(7)
    expect(interviewCards.every((card) => card.keyBeats.length >= 3)).toBe(true)
    expect(
      interviewCards.find((card) => card.id === 'technical-event-loop-output')?.codeExample,
    ).toContain('setTimeout')
  })
  it('restores valid attempts and survives malformed storage', () => {
    const state = { ...emptyPracticeState(), attempts: [attempt] }
    savePracticeState(state)
    expect(loadPracticeState()).toEqual(state)
    localStorage.setItem('interview-room.practice.v1', '{broken')
    expect(loadPracticeState()).toEqual(emptyPracticeState())
  })
  it('prioritizes low-score and low-confidence cards', () => {
    expect(weakCardIds([attempt])).toEqual([attempt.cardId])
    expect(
      weakCardIds([
        { ...attempt, confidence: 'ready', evaluation: { ...evaluation, overallScore: 88 } },
      ]),
    ).toEqual([])
    expect(
      weakSelfReviewCardIds([
        {
          id: 'self-1',
          cardId: 'why-apple',
          createdAt: '2026-09-18T00:00:00.000Z',
          durationSeconds: 45,
          confidence: 'needs-work',
        },
      ]),
    ).toEqual(['why-apple'])
  })
  it('calculates neutral pacing guidance', () => {
    expect(wordsPerMinute('one two three four', 2)).toBe(120)
    expect(pacingNote(120)).toContain('Conversational')
    expect(pacingNote(90)).toContain('fewer pauses')
    expect(pacingNote(190)).toContain('Fast pace')
  })
})
