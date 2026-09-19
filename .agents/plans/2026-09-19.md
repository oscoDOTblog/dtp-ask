# Add a technical flashcard category

## Summary

Add a seventh category containing all 60 questions from the pasted Apple WPC flashcards. They will use the existing spoken-answer practice flow and appear in mixed practice and the Settings study guide.

## Implementation

- Add a `technical-fundamentals` category and convert every pasted question into a card with a stable ID, short time target, key answer points, reference answer, and relevant follow-up. Preserve code examples and their line breaks in the question display.
- Keep overlapping architecture, payments, debugging, and testing questions: “full flashcard set” means none are omitted just because a longer-form card already exists.
- Pass the card category to AI evaluation. For these cards, grade factual correctness and reasoning against the expected points instead of applying the story-oriented rubric unchanged; show technical-appropriate rubric labels while retaining the existing saved evaluation shape. Leave evaluation of the original 20 cards unchanged.
- Update deck-count assertions and any study-guide counts that assume 20 cards. Preserve existing practice history and preferences.

## Verification

- Test that the deck has seven categories and 80 uniquely identified cards, including all 60 new prompts.
- Test technical versus existing evaluation instructions, code-example display, category and mixed sessions, and study-guide filtering.
- Run unit tests, build, and relevant Cypress practice flows.

## Assumptions

- The 60 `###` questions in the pasted response are the complete set, including the final “Interview Mental Models” questions.
- No separate flip-card mode or new storage format is needed.
