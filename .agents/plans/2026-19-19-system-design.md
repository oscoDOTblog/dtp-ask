# Add a payment reliability category

## Summary

Add an eighth category, “Payment reliability & incident response,” with 15 spoken-answer cards based on the pasted feedback. Keep the existing 80 cards, including overlapping retry and payment questions.

## Implementation

- Add nine short concept cards: idempotency keys, unknown/pending-confirmation state, reconciliation, transactional outbox, idempotent consumers, tokenization, exponential backoff with jitter, circuit breakers, and metrics → traces → logs/audit trail.
- Add six applied cards covering a degraded processor end to end, retry-versus-reconcile decisions, queue and traffic controls, customer messaging and return visits, incident dashboards and alerts, and post-incident review. Answers must distinguish a confirmed failure from an unknown outcome and never recommend blind payment retries.
- Give each card a stable ID, time target, key points, reference answer, and follow-up. Include the new category in category sessions, mixed practice, and the Settings study guide.
- Use the existing technical-feedback rubric for these cards, including its “reasoning” label. Keep the saved evaluation shape and existing practice history unchanged.

## Verification

- Assert eight categories and 95 unique cards, with all 15 new cards assigned to the new category.
- Test category and mixed sessions, study-guide filtering, and technical-feedback routing for the new category.
- Run unit tests, the production build, and Cypress practice flows.

## Assumptions

- “Concepts + scenarios” means nine focused recall cards plus six applied questions; no new practice mode or UI redesign is needed.
- Tokenization, outbox, and idempotent-consumer answers may add concise standard definitions where the pasted feedback names but does not explain them.
