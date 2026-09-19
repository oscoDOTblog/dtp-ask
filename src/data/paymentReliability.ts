import type { InterviewCard } from '@/types/interview'

export const paymentReliabilityCards: InterviewCard[] = [
  {
    id: 'payment-idempotency-key',
    category: 'payment-reliability',
    question: 'What should an idempotency key represent in a payment flow?',
    suggestedSeconds: 45,
    keyBeats: [
      'One stable key per logical payment intent',
      'Persist and enforce it server-side',
      'Reuse it on safe retries without creating a second charge',
    ],
    sampleResponse:
      'An idempotency key identifies one logical customer payment, not one HTTP attempt. The client or server creates a stable key for that intent, and the backend persists and enforces the mapping to its outcome. Retries reuse the same key so a repeated request cannot create a second charge. A genuinely new payment needs a new intent and key.',
    followUp: 'What should happen if the same key arrives with different payment details?',
  },
  {
    id: 'payment-unknown-state',
    category: 'payment-reliability',
    question: 'Why does a payment timeout require an unknown or pending-confirmation state?',
    suggestedSeconds: 45,
    keyBeats: [
      'Timeout describes missing confirmation, not definite failure',
      'Processor may already have charged the customer',
      'Persist uncertainty and reconcile before a new operation',
    ],
    sampleResponse:
      'A timeout tells us that we did not receive a definitive response. The processor might already have completed the charge. I would preserve the payment as unknown or pending confirmation, avoid telling the customer it failed, and reconcile with the processor before attempting any new financial operation.',
    followUp: 'What state would you show after a definitive processor decline?',
  },
  {
    id: 'payment-reconciliation',
    category: 'payment-reliability',
    question: 'What is payment reconciliation, and when is it needed?',
    suggestedSeconds: 60,
    keyBeats: [
      'Compare durable local state with authoritative processor outcome',
      'Resolve ambiguous or missed responses/events',
      'Move the payment to a verified terminal state without duplicate charging',
    ],
    sampleResponse:
      'Reconciliation checks our durable payment record against the authoritative processor record or event stream. It is especially important after a timeout, lost callback, or interrupted worker. We identify the original operation, determine its actual outcome, and move our state to succeeded or failed based on evidence rather than submitting a second charge.',
    followUp: 'What would you do if the processor cannot confirm the outcome yet?',
  },
  {
    id: 'payment-transactional-outbox',
    category: 'payment-reliability',
    question: 'What problem does a transactional outbox solve in a payment system?',
    suggestedSeconds: 60,
    keyBeats: [
      'Persist business-state change and event intent atomically',
      'Separate reliable publication from the database transaction',
      'Consumers still need idempotency because delivery can repeat',
    ],
    sampleResponse:
      'The outbox prevents a split-brain case where we commit a payment state change but crash before publishing its event, or publish without committing the state. We write the state change and an outbox record in one database transaction, then a separate publisher delivers the event. Delivery may be repeated, so consumers must handle duplicates.',
    followUp:
      'What happens if the publisher crashes after sending but before marking the outbox row delivered?',
  },
  {
    id: 'payment-idempotent-consumer',
    category: 'payment-reliability',
    question: 'What makes a payment-event consumer idempotent?',
    suggestedSeconds: 45,
    keyBeats: [
      'Duplicate delivery is expected',
      'Track event or operation identity durably',
      'Apply each business effect at most once',
    ],
    sampleResponse:
      'A consumer is idempotent when receiving the same event repeatedly has the same business effect as receiving it once. It can durably record a processed event ID or enforce a unique operation key in the same transaction as its state change. That matters because queues and outbox publishers commonly provide at-least-once delivery.',
    followUp: 'Why is acknowledging an event before committing its state change unsafe?',
  },
  {
    id: 'payment-tokenization',
    category: 'payment-reliability',
    question: 'What is payment tokenization, and what risk does it reduce?',
    suggestedSeconds: 45,
    keyBeats: [
      'Replace sensitive payment credentials with a limited-use token',
      'Keep raw credentials out of most application systems',
      'Tokens still require access control and careful scoping',
    ],
    sampleResponse:
      'Tokenization replaces sensitive payment credentials with a token that can be used only in an intended context, often through a provider or vault. It reduces how many systems handle raw card data and therefore limits exposure if an application is compromised. A token is not automatically harmless; it still needs authorization, scope, and protection.',
    followUp: 'How is a token different from simply encrypting a card number?',
  },
  {
    id: 'payment-backoff-jitter',
    category: 'payment-reliability',
    question: 'Why use bounded exponential backoff with jitter for payment-processor retries?',
    suggestedSeconds: 45,
    keyBeats: [
      'Cap attempts and total time',
      'Increase delay while the dependency recovers',
      'Jitter prevents synchronized retry spikes',
      'Only retry when operation semantics are safe',
    ],
    sampleResponse:
      'A bounded retry policy prevents endless pressure on a struggling processor. Exponential backoff increases the delay between attempts, while jitter spreads clients out so they do not all retry at once. Before retrying a payment, I must also know the request is safe to repeat through idempotency or reconcile an ambiguous outcome.',
    followUp: 'Which processor responses should not be retried?',
  },
  {
    id: 'payment-circuit-breaker',
    category: 'payment-reliability',
    question: 'How does a circuit breaker protect a payment system during processor degradation?',
    suggestedSeconds: 45,
    keyBeats: [
      'Open when failures or latency cross a threshold',
      'Stop normal calls temporarily',
      'Probe recovery and restore traffic gradually',
      'Choose an honest customer-facing state',
    ],
    sampleResponse:
      'A circuit breaker stops normal calls when processor failures or latency indicate it is unhealthy. That prevents our connections and retries from amplifying the incident. After a cooldown, limited probe traffic checks recovery before normal traffic resumes. We also need a product decision about whether to queue new payments or temporarily reject them.',
    followUp: 'How would you prevent the circuit from flapping during partial recovery?',
  },
  {
    id: 'payment-observability-levels',
    category: 'payment-reliability',
    question: 'How do metrics, traces, and logs or audit trails serve different incident needs?',
    suggestedSeconds: 60,
    keyBeats: [
      'Metrics and alerts detect broad impact',
      'Traces locate the failing path',
      'Structured logs and audit trail explain an individual operation',
    ],
    sampleResponse:
      'Metrics tell us something is wrong at population scale, such as rising timeout rate or reconciliation backlog. Traces show where latency or errors occur across services. Structured logs and an audit trail then explain what happened to a particular payment. I would start with alerts and dashboards, then drill down using correlation IDs.',
    followUp: 'Why are audit logs alone insufficient during a widespread processor incident?',
  },
  {
    id: 'payment-degraded-processor-design',
    category: 'payment-reliability',
    question:
      'A payment processor slows from 800 ms to 15 seconds during a traffic spike. How do you protect the system end to end?',
    suggestedSeconds: 120,
    keyBeats: [
      'Durably record payment intent and control processor concurrency',
      'Set timeouts and bounded idempotent retries with backoff and jitter',
      'Use circuit breaking or stop new submissions if needed',
      'Preserve unknown outcomes for reconciliation',
    ],
    sampleResponse:
      'I would make the payment a durable process rather than tie its correctness to one HTTP connection. Record the customer intent and stable idempotency key, then control how much work reaches the processor through bounded workers or a queue. Set timeouts, use limited backoff with jitter only for safe retries, and open a circuit if the dependency is severely unhealthy. A sent request that times out becomes unknown and enters reconciliation, not an automatic new charge. I would monitor latency, success, backlog, and customer impact while deciding with product whether to pause new payments.',
    followUp: 'When would you stop accepting new payments instead of queuing them?',
  },
  {
    id: 'payment-retry-or-reconcile',
    category: 'payment-reliability',
    question: 'A processor call timed out after your system sent it. Do you retry or reconcile?',
    suggestedSeconds: 90,
    keyBeats: [
      'Do not equate timeout with failure',
      'Preserve the original logical operation and idempotency key',
      'Query or receive authoritative status before any new charge',
      'Retry only when semantics guarantee safety',
    ],
    sampleResponse:
      'I would first classify the outcome as unknown. The processor may have completed the charge, so blindly creating another request is unsafe. I would retain the same payment ID and idempotency key, consult the provider’s status or events, and reconcile our durable state. If the provider explicitly supports idempotent replay, a bounded retry of the same logical operation may be safe; otherwise I wait for confirmation or escalate rather than risk a second charge.',
    followUp: 'What if the processor does not support idempotency or a status lookup?',
  },
  {
    id: 'payment-queue-controls',
    category: 'payment-reliability',
    question:
      'How would you use a queue without letting delayed payments or retries overwhelm a failing processor?',
    suggestedSeconds: 90,
    keyBeats: [
      'Durable intent before enqueueing',
      'Bound concurrency, queue depth, and retry attempts',
      'Backoff with jitter and circuit-breaker behavior',
      'Surface backlog age and decide when to stop intake',
    ],
    sampleResponse:
      'A queue decouples customer traffic from processor calls, but it is not an infinite buffer. I would persist the payment intent, use bounded workers and retry budgets, add backoff with jitter, and pause or limit dispatch while a circuit is open. I would watch queue depth and oldest-item age, because a growing backlog changes the customer promise. If we cannot process within an acceptable window, the business may choose to stop accepting new submissions rather than accumulate uncertain obligations.',
    followUp: 'Which queue metric tells you customers are waiting too long?',
  },
  {
    id: 'payment-customer-incident',
    category: 'payment-reliability',
    question: 'What should a customer see when their payment cannot be confirmed promptly?',
    suggestedSeconds: 75,
    keyBeats: [
      'Say confirmation is delayed without claiming failure',
      'Do not encourage duplicate submission',
      'Persist status across close and return',
      'Offer updates or a clear unavailable state when appropriate',
    ],
    sampleResponse:
      'I would say we are taking longer than usual to confirm the payment, that the customer does not need to submit it again, and that we will update its status when confirmation is available. The state is durable, so they can leave and return to see the current status rather than watch an endless spinner. If we cannot responsibly accept new payments during the incident, I would show a clear temporarily unavailable message instead of implying an uncertain payment is processing.',
    followUp: 'How would you handle a customer returning while reconciliation is still pending?',
  },
  {
    id: 'payment-incident-dashboard',
    category: 'payment-reliability',
    question: 'What would you alert on and show in a dashboard during a processor incident?',
    suggestedSeconds: 90,
    keyBeats: [
      'Processor latency, timeout/error and payment success rates',
      'Pending-confirmation count, queue depth/age, retry rate, reconciliation backlog',
      'Circuit-breaker state and processor error codes',
      'Trace and correlate affected individual payments',
    ],
    sampleResponse:
      'I would want alerts for customer-impacting changes in processor latency, timeout rate, and payment success rate. The dashboard should show pending confirmations, queue depth and age, retry rate, circuit-breaker state, processor error codes, and reconciliation backlog. Those metrics tell us whether safeguards are containing the incident. Traces and structured logs with correlation IDs let us inspect a specific failing path or payment after the broad signal identifies the problem.',
    followUp: 'Which metric would tell you retries are making recovery worse?',
  },
  {
    id: 'payment-post-incident-review',
    category: 'payment-reliability',
    question: 'How would you run a post-incident review after a payment-processor outage?',
    suggestedSeconds: 90,
    keyBeats: [
      'Timeline, detection, response, and customer impact',
      'Verify double charges and reconcile unresolved payments',
      'Assess retries, safeguards, messaging, and manual work',
      'Identify systemic improvements and owned actions without blame',
    ],
    sampleResponse:
      'I would first verify that unresolved payments are reconciled and check whether anyone was double charged. Then I would build a factual timeline: onset, detection, response, recovery, and customer impact. I would evaluate whether retries, circuit breaking, queue controls, and customer messaging worked as intended or made things worse. The review should focus on system properties that allowed the impact, not blaming a person, and end with prioritized, owned changes to detection, automation, tests, and runbooks.',
    followUp: 'What would you change if alerts fired only after customers reported the issue?',
  },
]
