import { describe, expect, it } from 'vitest'
import { interviewCards } from '@/data/deck'

describe('follow-up guidance', () => {
  it('provides an answer for every interview card', () => {
    expect(interviewCards.length).toBeGreaterThan(0)
    for (const card of interviewCards) {
      expect(card.followUpAnswer.trim()).toBeTruthy()
    }
  })
})
