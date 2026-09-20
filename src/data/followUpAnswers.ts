import type { InterviewCard } from '@/types/interview'

type CardWithoutFollowUpAnswer = Omit<InterviewCard, 'followUpAnswer'>

const answers: Record<string, string> = {
  'tell-me-about-yourself':
    'Owning a product end to end changed my starting question. I now ask what problem a person is trying to solve before deciding what to build, then stay accountable for the experience after release. Connect this to a specific Sway decision you made.',
  'why-apple':
    'Choose a product you have actually used and describe one precise interaction. For example, Apple Pay makes a complex authorization flow feel like a clear, brief confirmation. Explain how its feedback and failure states preserve trust, and avoid claims about internal implementation.',
  'why-wpc':
    'An ambiguous payment outcome is especially dangerous: a timeout can hide a successful charge. Preserve a pending state, check the original operation with a stable identifier, and do not initiate a second charge until its outcome is known.',
  'why-return-to-large-org':
    'Coordination will take more time than when I could decide alone. I would make decisions legible, involve the right owners early, and keep momentum by defining a small next step and a clear decision deadline.',
  'built-end-to-end':
    'Name a real compromise from Sway, why it was acceptable for the first release, and how you limited its cost. A good answer distinguishes a reversible product shortcut from a security or data-integrity shortcut; add the signal that would trigger revisiting it.',
  'feedback-changed-sway':
    'Describe the original assumption, what dancers actually said or did, and the concrete change you shipped. Finish with the result you observed; if you lack a measured outcome, say what evidence you would collect next.',
  'shipping-own-product':
    'Identify one decision you would revisit, such as validating a narrow practice workflow before building broader features. Explain what evidence you have now, what smaller experiment you would run, and what you would keep.',
  disagreement:
    'If evidence stayed mixed, I would clarify the cost of each option, choose a reversible experiment with a deadline, and agree on a success measure. For an irreversible choice, I would gather the missing evidence or escalate the decision explicitly.',
  'changed-your-mind':
    'I write down what evidence would change my view before testing an idea. I invite someone to challenge the weakest assumption and compare results against the original goal, so changing direction feels like learning rather than losing an argument.',
  'quality-vs-delivery':
    'Use a true example: state the shortcut, the deadline or learning goal, the risk you accepted, and the guardrails. Name who owned cleanup and what event or date would trigger it. Never imply you deferred payment correctness or security.',
  'hardest-problem':
    'Identify the missing observable boundary: a request or job ID, timing trace, state-transition log, or provider reference. Explain how that signal would have narrowed the search, and what you added after the incident.',
  'production-debugging':
    'Give an update cadence and audience. Report customer impact, what is confirmed, what remains uncertain, current mitigation, owner, and next update time. Avoid presenting a hypothesis as the root cause.',
  'external-service-failure':
    'Do not retry when the operation may already have committed, the failure is permanent, the request is invalid, or the retry would exceed a deadline or overload the dependency. First identify whether the operation is safe to repeat.',
  'payment-ambiguity':
    'Without provider idempotency, keep a durable local payment intent and prevent concurrent submissions. If the outcome is unknown, use a provider reference or reconciliation channel before any new charge; if neither exists, stop automatic retries and escalate for manual resolution.',
  'transaction-api':
    'Ask who may read each transaction, enforce authorization on the server, and expose only fields the UI needs. Use stable pagination, explicit status semantics, request IDs, and an API contract that distinguishes pending from final outcomes.',
  'frontend-performance':
    'Track user-facing load and interaction latency, including LCP and INP, plus API latency and error rate for the transaction data. Segment by device and network, and monitor whether stale or incomplete data is shown.',
  'test-payments':
    'Use a fake processor with scripted outcomes and a controlled clock. Make each test specify whether the charge committed, which response or callback is lost, and the expected final state; assert one financial effect after retries.',
  'design-sway':
    'Keep the media private at the origin and authorize each playback request. Issue short-lived signed CDN URLs or cookies scoped to the asset, limit cache lifetime, and prevent public indexing; revoke or rotate access when entitlement changes.',
  'react-to-vue':
    'I would examine Vue reactivity and ref unwrapping, computed versus watch, component communication, and lifecycle cleanup. I would build a small feature and check testing and state-management conventions before assuming React patterns map directly.',
  'vue-vs-next':
    'Next.js becomes attractive when the product needs server rendering, route-level data loading, or its React ecosystem and deployment model. I would compare those requirements with team expertise and operational cost rather than choosing by popularity.',

  'payment-idempotency-key':
    'Reject the conflicting request rather than returning the earlier result as if it matched. Store a fingerprint of the original amount, currency, payee, and intent; return a clear conflict response and investigate repeated mismatches.',
  'payment-unknown-state':
    'Show a definitive declined or failed state with a safe explanation and a clear next action. A new attempt can be offered only after the original operation is known to be final, using a new payment intent.',
  'payment-reconciliation':
    'Keep the intent pending, retry status checks with bounded backoff, and surface that confirmation is still in progress. Set an escalation deadline and use an authoritative report or support path if the provider remains uncertain.',
  'payment-transactional-outbox':
    'The row remains undelivered, so the publisher will send it again. Include a stable event ID and make the consumer record processing atomically with its business effect, so duplicate delivery cannot duplicate the effect.',
  'payment-idempotent-consumer':
    'If an event is acknowledged before its state change commits, a crash can lose the change permanently because the broker believes delivery is complete. Commit the state change and deduplication record first, then acknowledge.',
  'payment-tokenization':
    'Encryption keeps card data recoverable with a key; a token is a surrogate reference whose usefulness is limited to an authorized vault or processor context. Tokenization reduces where raw card data must exist, but token access still needs protection.',
  'payment-backoff-jitter':
    'Do not retry validation failures, definitive declines, authentication requirements, or other permanent responses. For an ambiguous mutation, reconcile the original operation before resubmitting even if the transport error looks transient.',
  'payment-circuit-breaker':
    'After a cool-down, allow a small number of probe requests in a half-open state. Require sustained healthy responses before closing, and reopen quickly on failure; add thresholds and jitter to avoid synchronized traffic.',
  'payment-observability-levels':
    'Audit logs explain individual events but are poor at showing incident scale in real time. Add metrics for success, decline, unknown outcomes, latency, queue age, and retries, with traces or IDs to investigate affected payments.',
  'payment-degraded-processor-design':
    'Stop new submissions when the queue cannot meet a stated customer deadline, capacity or funding rules are at risk, or outcomes cannot be safely reconciled. Tell customers the service is unavailable instead of silently accumulating uncertain payments.',
  'payment-retry-or-reconcile':
    'Without idempotency or status lookup, an unknown outcome cannot be retried safely. Block automatic resubmission, preserve all references and timing, seek settlement or support records, and resolve manually before inviting a new payment.',
  'payment-queue-controls':
    'Oldest item age measures how long a real customer has waited. Compare it with the promised confirmation window, and track p95 age plus backlog and drain rate to see whether the queue is recovering.',
  'payment-customer-incident':
    'Show the existing payment as still being confirmed, with its reference and a clear update path. Do not present a fresh Pay action that could duplicate the charge; provide support access if confirmation exceeds the promised window.',
  'payment-incident-dashboard':
    'A rising retry-to-success ratio, growing processor errors, or increasing queue age despite more retry traffic suggests retries are amplifying the incident. Reduce concurrency and back off while monitoring confirmed outcomes.',
  'payment-post-incident-review':
    'Add alerts on customer-facing leading signals such as unknown-outcome rate, approval drop, p95 latency, and oldest pending age. Test the thresholds against incident data so the team is paged before customers must report failures.',

  'technical-event-loop-order':
    'It joins the same microtask queue. The runtime keeps draining that queue before moving to the next task, so a long chain of microtasks can delay timers and rendering.',
  'technical-common-microtasks':
    'Yes. A microtask may enqueue another microtask, which runs before the next task. Repeatedly doing this can starve the event loop.',
  'technical-common-tasks':
    'After one task completes, the runtime drains queued microtasks before starting the next task. Browsers may also render between task turns.',
  'technical-event-loop-output':
    'The second Promise callback is added to the microtask queue and runs before the timer. Its exact position depends on other microtasks already queued.',
  'technical-timeout-zero':
    'The resolved Promise callback runs first because it is a microtask; the zero-delay timer is a later task. Zero delay is a minimum threshold, not immediate execution.',
  'technical-async-thread':
    'Use a Web Worker for browser CPU work, or move it to a backend job. Async functions alone still execute JavaScript on the calling thread.',
  'technical-cpu-vs-io':
    'Fetching transaction records is primarily I/O-bound because most time is spent waiting for network and server responses. Large parsing or aggregation afterward could become CPU-bound.',
  'technical-concurrency-parallelism':
    'Yes. Multiple fetches can be in flight while the single JavaScript thread handles their callbacks one at a time. The browser and network stack perform the waiting outside that thread.',
  'technical-sequential-fetch':
    'Bound concurrency when the list is large, the API has rate limits, or each response consumes substantial resources. Start with a measured limit and adjust from latency and error signals.',
  'technical-promise-all':
    'No. Promise.all rejects as soon as one input rejects, but other operations continue unless you cancel them explicitly, such as with AbortController where supported.',
  'technical-promise-all-thousands':
    'Start from the service rate limit and client resource budget, then load test. Monitor throughput, p95 latency, errors, and throttling while adjusting a small bounded pool.',
  'technical-all-vs-all-settled':
    'Use Promise.allSettled when widgets are independent and a failed widget should not hide successful ones. Render each result or its own error state.',
  'technical-closure-definition':
    'A closure can keep private state for a counter, memoized function, or callback that remembers configuration. Avoid retaining large objects longer than needed.',
  'technical-closure-counter':
    'Both functions would increment the same count, producing 1, 2, 3, 4 in call order. Separate factory calls normally create separate captured environments.',
  'technical-closure-survival':
    'Once no reachable function or object references the environment, it becomes eligible for garbage collection. The timing of collection is not guaranteed.',
  'technical-vue-reactivity':
    'Mutating a plain local variable does not notify Vue, so the template will not rerender because of that mutation. Put view-driving state in a ref or reactive object.',
  'technical-vue-ref':
    'In script, mutate the existing array through transactions.value or replace it with a new array assigned to transactions.value. Vue tracks either change.',
  'technical-ref-vs-reactive':
    'A ref lets you replace the whole object through .value while preserving a stable reactive container. Reassigning a reactive variable can leave consumers holding the old proxy.',
  'technical-computed-use':
    'Vue invalidates the cached computed value when a tracked dependency changes and recalculates it on the next read. Use it for derived values without side effects.',
  'technical-watch-use':
    'Use computed when you need a derived value for rendering or other calculations. Watch is for effects, such as network requests or analytics, triggered by a change.',
  'technical-pending-computed':
    'Use watch if a change in pending transactions must trigger an effect, such as fetching details or sending a metric. Keep the list itself computed.',
  'technical-analytics-watch':
    'Watch the specific count, compare old and new values, and send only on meaningful transitions. If events can retry, attach a stable event ID or deduplicate downstream.',
  'technical-vue-props':
    'The child emits an event or calls a clearly owned callback; the parent changes its state and passes the updated value back as a prop. The child should not mutate a prop directly.',
  'technical-prop-drilling':
    'For a short, stable component chain, explicit props are easy to follow. Introduce shared state or provide/inject only when the repeated plumbing obscures ownership.',
  'technical-shared-state':
    'Keep it in the parent and pass it to the child as a prop, with an event for updates. There is no need for a global store.',
  'technical-server-vs-ui-state':
    'The authoritative backend or ledger owns the balance. The UI may cache a snapshot, but should show its freshness and refresh after a relevant transaction.',
  'technical-main-thread-freeze':
    'Record a browser performance trace around the freeze and look for long tasks overlapping delayed input or frames. Identify the function and data size before choosing a fix.',
  'technical-web-worker-use':
    'Posting and copying large payloads can cost time and memory. Consider transferable buffers and measure serialization overhead against the main-thread time saved.',
  'technical-worker-fetch':
    'If parsing, decoding, or aggregating the response is CPU-heavy enough to block input, move that processing to a worker. Measure before adding message-passing complexity.',
  'technical-slow-page-first-step':
    'Use the browser Performance panel to inspect main-thread tasks and rendering. Pair it with the Network panel if requests or assets may be the bottleneck.',
  'technical-perceived-performance':
    'A skeleton can mislead if it lasts longer than the content would, shifts the layout, or hides that an operation is stalled. Use it only when the layout is predictable and pair it with honest error feedback.',
  'technical-paginate-transactions':
    'Use cursor pagination with a stable sort key so new transactions do not shift earlier pages. Return a next cursor and avoid making the client fetch an unbounded history.',
  'technical-stale-while-revalidate':
    'An active payment result or available balance may be unsafe to show stale without a clear timestamp or pending label. History often tolerates a short stale interval better.',
  'technical-financial-cache-risk':
    'Label the value as last updated at a specific time, show a refresh or pending indicator, and avoid presenting it as current when it drives a financial decision.',
  'technical-financial-source-truth':
    'Keep the UI pending or unknown, query the original payment by stable reference, and update from an authoritative status. Do not infer failure from a timeout or start a new charge automatically.',
  'technical-bff-definition':
    'Keep the ledger and authoritative payment state in domain services. A BFF can shape responses and coordinate calls, but should not become an independent source of financial truth.',
  'technical-bff-benefits':
    'If one backend API already fits the client and authorization model, a BFF adds hops, maintenance, and another failure point without enough benefit.',
  'technical-api-design-question':
    'Start with what the detail view must show and which actions it supports. Return a stable transaction ID, clear status, authorized fields, and enough metadata for loading, error, and pending states.',
  'technical-batch-api':
    'Set a maximum number of IDs and response size, enforce authorization for every item, and return per-item results so one missing record does not obscure the rest.',
  'technical-blind-payment-retry':
    'A stable key identifies one logical payment across retries. The server binds it to the original request and outcome, preventing repeated HTTP attempts from creating additional charges.',
  'technical-idempotency':
    'Enforce it durably on the server at the payment boundary. A client-generated key is useful, but client-only checks cannot protect against duplicate requests or restarts.',
  'technical-payment-timeout-state':
    'Show that the payment is being confirmed, provide a reference or update path, and avoid wording that claims success or failure. Disable a fresh charge until the original outcome is resolved.',
  'technical-payment-failure-experience':
    'Say “We are still confirming your payment” and explain when to check again or contact support. Avoid “payment failed” until a definitive failure is known.',
  'technical-pay-does-nothing':
    'Check whether the click handler fires, whether validation blocks submission, and whether the button is disabled or covered. Inspect console errors and state transitions before looking at the backend.',
  'technical-http-request-split':
    'Yes. A service worker may intercept a request, serve cached data, or fail before it reaches the network. Inspect its registration and bypass it during diagnosis.',
  'technical-unobserved-errors':
    'Add a correlated payment-attempt ID spanning UI, API, and processor calls, with a counter for unknown or pending outcomes. Log only non-sensitive status and timing data.',
  'technical-intermittent-bug':
    'Use opaque request IDs, status codes, timing, and carefully scoped metadata. Redact account and payment details, control access to traces, and avoid logging tokens or card data.',
  'technical-testing-layers':
    'Test duplicate submissions and key conflicts at the API and persistence boundary with integration tests. Add an end-to-end check for the customer-visible pending and final states.',
  'technical-payment-test-edges':
    'Configure a fake processor to commit the charge but withhold its response. Advance a controlled clock, run reconciliation, and assert one charge and the expected final UI state.',
  'technical-mental-cpu':
    'Use a worker for significant browser-only computation, chunk small work that can yield between frames, or move large shared processing to a backend. Measure latency and transfer costs.',
  'technical-mental-io':
    'Bound it when the downstream service has limits, the request list is large, or parallel work increases errors and memory use. Tune against observed throughput and latency.',
  'technical-mental-many-requests':
    'Batch when the resources are naturally requested together and the server can return them efficiently. Bound concurrent calls when each request is independent or batch responses would be unwieldy.',
  'technical-mental-derived-state':
    'Watch is appropriate when the state change triggers an effect, such as an API call or analytics. Keep a pure derived display value in computed.',
  'technical-mental-side-effect':
    'Debounce effects driven by rapid input, such as search requests or autosave. Avoid debouncing critical payment state transitions that require immediate durable handling.',
  'technical-mental-child-data':
    'Use provide/inject for a dependency needed by many descendants when passing it through every layer becomes noisy, especially within a bounded component subtree.',
  'technical-mental-shared-data':
    'Server data comes from an authoritative service and needs fetching, freshness, and error handling. UI state is locally owned interaction state such as an open dialog or selected tab.',
  'technical-mental-slow-ui':
    'Interaction to Next Paint (INP) captures delayed response to a click. Pair it with a performance trace to identify the task or rendering work causing the delay.',
  'technical-mental-prod-bug':
    'A correlation or request ID connects the browser action to API logs and downstream traces. Carry it across boundaries without including sensitive customer data.',
  'technical-mental-timeout':
    'Reuse the original payment intent and idempotency key, disable duplicate submission, and reconcile its status before allowing a new attempt.',
  'technical-mental-mutation-retry':
    'Enforce idempotency on the server where the mutation occurs, backed by durable storage. The client should reuse a stable key for retries of the same intent.',
}

export function withFollowUpAnswers(cards: CardWithoutFollowUpAnswer[]): InterviewCard[] {
  return cards.map((card) => {
    const followUpAnswer = answers[card.id]
    if (!followUpAnswer) throw new Error(`Missing follow-up answer for ${card.id}`)
    return { ...card, followUpAnswer }
  })
}
