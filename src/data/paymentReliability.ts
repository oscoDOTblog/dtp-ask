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
    beatDetails: [
      'A logical intent is the customer action to pay once. HTTP attempts are only delivery attempts for that same intent.',
      'A backend must durably associate the key with the payment and reject conflicting reuse; a client-only key cannot prevent duplicate charges by itself.',
      'Retry with the original key and payment identity. Generate a new key only for a genuinely new customer payment.',
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
    beatDetails: [
      'A timeout tells us the response did not arrive within our deadline. It does not tell us what happened after the processor received the request.',
      'The charge and the response are separate events: the charge may commit even if the network drops the acknowledgment.',
      'Keep a durable pending-confirmation state, query or consume the authoritative outcome, and do not create a fresh charge while the original is unresolved.',
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
    beatDetails: [
      'Use a stable payment or processor reference to compare your record with the provider’s authoritative record.',
      'Reconciliation catches timeouts, lost callbacks, delayed events, and workers that crashed between steps.',
      'Only transition to succeeded or failed on evidence. Reconciliation checks the original operation rather than submitting another charge.',
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
    beatDetails: [
      'Store the payment change and an outbox event in one database transaction so they either both commit or neither does.',
      'A separate publisher reads the outbox and sends events after the transaction commits, avoiding a fragile dual write.',
      'If publishing succeeds but acknowledgment fails, the event may be sent again. Consumers must safely deduplicate its effect.',
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
    beatDetails: [
      'Many queues provide at-least-once delivery: an event can be redelivered after a crash or lost acknowledgment.',
      'Record a stable event ID or enforce a unique business-operation key in durable storage, ideally with the state update.',
      'The handler may execute more than once, but repeated execution must not repeat the financial or customer-visible effect.',
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
    beatDetails: [
      'A provider or vault maps the token to the real credential; the token should be usable only for its intended merchant or transaction context.',
      'Most services can handle the token instead of a card number, reducing exposure and the number of places raw data can leak.',
      'A stolen token can still be abused within its scope, so protect it with authorization, limited permissions, and monitoring.',
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
    beatDetails: [
      'Set a retry budget: a maximum number of attempts or deadline. Never retry a payment indefinitely.',
      'Increasing delays reduce pressure on a dependency that may need time to recover.',
      'Randomized delay spreads many clients or workers across time instead of creating a synchronized retry storm.',
      'For a sent-but-timed-out mutation, first establish idempotent replay or reconcile its status; delay alone does not make a retry safe.',
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
    beatDetails: [
      'Track dependency health with a rolling window so a sustained error or latency spike trips the breaker rather than one isolated failure.',
      'While open, fail fast or defer work instead of tying up connections and worsening the processor outage.',
      'A half-open state permits limited probes; close only after evidence of recovery and ramp traffic carefully.',
      'Whether to queue a payment or temporarily reject new submissions is a product decision tied to how reliably work can be completed.',
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
    beatDetails: [
      'Rates, latency, backlog, and success metrics show the size and direction of customer impact and should trigger alerts.',
      'Distributed traces connect service hops and show where time is spent or errors first appear.',
      'Correlated logs explain a specific request; a durable audit trail records the payment’s business-state transitions.',
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
    beatDetails: [
      'The customer’s intent must survive a lost browser connection. A queue or bounded worker pool then limits calls to the degraded processor.',
      'Set request deadlines and retry budgets; reuse the same logical payment identity and spread retry attempts with jitter.',
      'A breaker can stop calls that are likely to fail. If the backlog cannot meet the customer promise, surface the decision to pause intake.',
      'Any request sent without a definitive response stays pending confirmation until the processor’s authoritative status is known.',
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
    beatDetails: [
      'The processor could have committed the charge and lost only its response, so the observed timeout is an unknown outcome.',
      'Keep the same payment record and key while investigating; a fresh key could represent a second charge.',
      'Check a provider status endpoint, event, or settlement record for the original operation before concluding success or failure.',
      'If the provider explicitly guarantees idempotent replay of that operation, a bounded retry may be safe; otherwise reconcile or escalate.',
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
    beatDetails: [
      'Record the payment and its idempotency key before acknowledging customer intake so the work cannot disappear with the browser session.',
      'Limit workers, retries, and acceptable backlog. A queue can absorb a spike but cannot be treated as infinite capacity.',
      'Slow retries and pause dispatch when the processor is unhealthy instead of turning the queue into a retry amplifier.',
      'Oldest-item age reflects customer waiting time. If it exceeds the promised window, consider stopping new submissions.',
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
    beatDetails: [
      'Use language such as “We’re taking longer than usual to confirm your payment” while the outcome is unknown.',
      'Explicitly tell the customer they do not need to submit again; “try again” could produce another payment.',
      'The payment status must live on the server so the customer can close the tab and return to the same operation.',
      'Notify the customer when confirmed if the product supports it; if new payments cannot be accepted safely, say they are temporarily unavailable.',
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
    beatDetails: [
      'These are the fastest broad signals of dependency health and customer-visible impact; alert on meaningful deviations.',
      'These show whether uncertainty and delayed work are accumulating, even when the processor’s error rate begins improving.',
      'Breaker state explains whether traffic is being blocked; error-code breakdown helps separate transient outages from permanent rejections.',
      'Use correlation IDs to move from an aggregate alert to the specific request path and payment audit history without exposing sensitive data.',
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
    beatDetails: [
      'A shared timeline establishes when degradation began, how it was detected, what changed, and how many customers were affected.',
      'Financial correctness comes first: resolve unknown payments and check for duplicate charges or refunds needed.',
      'Review whether queue controls, retry budgets, circuit breaking, alerts, customer copy, and manual interventions helped or hurt.',
      'Focus on system properties rather than individual blame, then assign concrete owners and deadlines to preventive changes.',
    ],
    sampleResponse:
      'I would first verify that unresolved payments are reconciled and check whether anyone was double charged. Then I would build a factual timeline: onset, detection, response, recovery, and customer impact. I would evaluate whether retries, circuit breaking, queue controls, and customer messaging worked as intended or made things worse. The review should focus on system properties that allowed the impact, not blaming a person, and end with prioritized, owned changes to detection, automation, tests, and runbooks.',
    followUp: 'What would you change if alerts fired only after customers reported the issue?',
  },
]
