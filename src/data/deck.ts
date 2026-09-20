import type { Category, InterviewCard } from '@/types/interview'
import { technicalFundamentalsCards } from '@/data/technicalFundamentals'
import { paymentReliabilityCards } from '@/data/paymentReliability'
import { withFollowUpAnswers } from '@/data/followUpAnswers'
import { beatDetails } from '@/data/beatDetails'

export const categories: Category[] = [
  {
    id: 'story',
    name: 'Personal narrative & motivation',
    shortName: 'Your story',
    description: 'Connect your path, motivation, and fit without sounding rehearsed.',
    accent: '#ffb000',
  },
  {
    id: 'product',
    name: 'Product ownership & Sway',
    shortName: 'Product',
    description: 'Show what changed when you owned the entire problem.',
    accent: '#55d6be',
  },
  {
    id: 'collaboration',
    name: 'Leadership & collaboration',
    shortName: 'Collaboration',
    description: 'Make sound judgment and productive disagreement visible.',
    accent: '#ff7a90',
  },
  {
    id: 'reliability',
    name: 'Production engineering & reliability',
    shortName: 'Reliability',
    description: 'Demonstrate calm, evidence-led engineering under pressure.',
    accent: '#a9b8ff',
  },
  {
    id: 'architecture',
    name: 'Frontend, API & system design',
    shortName: 'Architecture',
    description: 'Reason from the customer experience through system boundaries.',
    accent: '#62b6ff',
  },
  {
    id: 'team-fit',
    name: 'Vue & team fit',
    shortName: 'Team fit',
    description: 'Show transferable fluency without pretending every framework is identical.',
    accent: '#d0f06f',
  },
  {
    id: 'technical-fundamentals',
    name: 'Technical fundamentals',
    shortName: 'Fundamentals',
    description: 'Build fast recall across JavaScript, Vue, browsers, APIs, and payments.',
    accent: '#e4a8ff',
  },
  {
    id: 'payment-reliability',
    name: 'Payment reliability & incident response',
    shortName: 'Payments',
    description: 'Handle ambiguous outcomes, processor degradation, and recovery safely.',
    accent: '#ff9878',
  },
]

export const interviewCards: InterviewCard[] = withFollowUpAnswers([
  {
    id: 'tell-me-about-yourself',
    category: 'story',
    question: 'Tell me about yourself.',
    suggestedSeconds: 90,
    keyBeats: [
      'Six years of growth at Capital One',
      'Independent product-building chapter',
      'Sway as evidence of whole-problem ownership',
      'Why that combination points to this role',
    ],
    sampleResponse:
      'I’m a full-stack engineer who is happiest owning the whole problem. I spent about six years at Capital One, growing from associate engineer to principal associate and learning to build software where reliability, security, and details matter. I then pushed myself in a different direction by building products independently. Sway began with a problem I had as a dancer: I recorded classes but rarely practiced those videos effectively. Shipping it meant talking to dancers, designing the experience, writing the iOS app, working through video and backend architecture, and getting it through App Store review. That changed how I think. When I see a button now, I think about everything underneath it—but also whether the button should exist. This role stands out because it values both serious engineering and the quality of the customer experience.',
    followUp: 'Which part of that transition changed how you work most?',
  },
  {
    id: 'why-apple',
    category: 'story',
    question: 'Why Apple?',
    suggestedSeconds: 60,
    keyBeats: [
      'Craft and simplification',
      'Complexity hidden from customers',
      'Engineering and product quality together',
    ],
    sampleResponse:
      'Building my own products made me almost annoyingly sensitive to small pieces of friction. I’ll build an interaction that technically works, use it, and realize it still does not feel right—then spend another evening simplifying it. That has made me appreciate products where the customer sees very little of the complexity underneath. Apple operates at an extreme version of that challenge. I do not want to choose between difficult engineering problems and caring deeply about the experience. I want to work somewhere both are treated as part of the engineering job.',
    followUp: 'What Apple product best demonstrates that quality to you, and why?',
  },
  {
    id: 'why-wpc',
    category: 'story',
    question: 'Why Wallet, Payments & Commerce?',
    suggestedSeconds: 75,
    keyBeats: [
      'Financial-system maturity',
      'Consumer-product empathy',
      'Trust and correctness',
      'Simple experience over complex systems',
    ],
    sampleResponse:
      'Wallet sits at the intersection of two parts of my career. Capital One taught me what it means to build around financial systems, where correctness, security, reliability, and trust are not optional. Building consumer products taught me to care just as deeply about what the person actually experiences. Payments combine those worlds. A customer sees tap, authenticate, done, while the system coordinates APIs, authorization, state transitions, partners, retries, and ambiguous failures. I like that contrast. The engineering can be incredibly complicated, but our job is to make sure the customer never has to understand that complexity.',
    followUp: 'Which payment failure mode do you think is most important to design for?',
  },
  {
    id: 'why-return-to-large-org',
    category: 'story',
    question: 'Why return from independent product building to a large engineering organization?',
    suggestedSeconds: 75,
    keyBeats: [
      'Independent work was deliberate growth',
      'Desire for scale and strong peers',
      'Keep product ownership mindset',
      'Not framed as retreat',
    ],
    sampleResponse:
      'Independent product work gave me exactly what I wanted from it: sharper product instincts, comfort with ambiguity, and the experience of being accountable for every layer. I now want to bring that mindset back to problems that require a level of scale, collaboration, and operational depth one person cannot create alone. I miss learning alongside strong engineers and working through decisions where the consequences reach millions of customers. This is not a move away from ownership. It is a chance to apply a broader definition of ownership inside a team solving much larger problems.',
    followUp:
      'What part of working in a larger organization do you expect to find challenging again?',
  },
  {
    id: 'built-end-to-end',
    category: 'product',
    question: 'Tell me about something you built end-to-end.',
    suggestedSeconds: 120,
    keyBeats: [
      'Personal problem',
      'Discovery changed the product',
      'Full-stack ownership',
      'A real shipping moment',
      'Lesson carried forward',
    ],
    sampleResponse:
      'One project I’m especially proud of is Sway, an app I built for dancers. I kept leaving class with videos that disappeared into my camera roll, so I initially thought I would build a better player. Talking with dancers showed me the player was not the real problem—the problem was turning class material into a repeatable practice habit. I built the experience around useful clips, looping, speed changes, mirroring, practice capture, and an organized library. I owned the product design, SwiftUI and AVFoundation work, persistence, backend decisions, StoreKit, testing, deployment, and App Store submission. Seeing it approved mattered because the abstraction disappeared: an idea on my laptop had become something another person could download. It confirmed that I do my best engineering when I can follow a need all the way to someone using the result.',
    followUp: 'Which technical compromise did you make to get the first version shipped?',
  },
  {
    id: 'feedback-changed-sway',
    category: 'product',
    question: 'How did user feedback change Sway?',
    suggestedSeconds: 75,
    keyBeats: [
      'Initial hypothesis',
      'Specific observed feedback',
      'Reframed user need',
      'Product change',
      'Evidence after change',
    ],
    sampleResponse:
      'My initial hypothesis was that dancers needed a better video player. Early conversations and use showed that playback controls alone did not change behavior. People needed less friction between recording a class and starting a focused practice session. That reframed Sway from a media utility into a practice tool, and it changed how I prioritized capture, clip selection, looping, speed, mirroring, and organization. The important lesson was not simply to listen to feature requests. It was to look for the underlying behavior the requests were pointing toward. [Add one concrete dancer observation and the result of the product change.]',
    followUp:
      'How did you decide that the feedback represented a real pattern rather than one preference?',
    placeholders: [
      'A concrete dancer observation',
      'Evidence that the change improved the experience',
    ],
  },
  {
    id: 'shipping-own-product',
    category: 'product',
    question: 'What did shipping your own product teach you?',
    suggestedSeconds: 75,
    keyBeats: [
      'Requirements are hypotheses',
      'Tradeoffs become personal',
      'Operations and distribution matter',
      'Changed engineering behavior',
    ],
    sampleResponse:
      'It taught me that writing the feature is only one piece of delivering value. When I owned Sway, no separate team absorbed unclear requirements, awkward onboarding, a storage decision, App Store policy, or a support issue. Every shortcut returned to me in another form. I became more deliberate about validating the problem before polishing the implementation, and more practical about choosing where quality mattered most for the user. The biggest change is that I now treat product behavior, operability, and maintainability as one engineering problem rather than three handoffs.',
    followUp: 'What is one decision you would make differently if you started Sway today?',
  },
  {
    id: 'disagreement',
    category: 'collaboration',
    question: 'Tell me about a disagreement with another engineer.',
    suggestedSeconds: 90,
    keyBeats: [
      'Two reasonable positions',
      'Different risks being optimized',
      'Evidence or experiment',
      'Your change in thinking',
      'Outcome',
    ],
    sampleResponse:
      'Another engineer and I disagreed about [architecture decision]. I preferred [option A] because I was optimizing for [risk or outcome]. They preferred [option B] because they were worried about [different risk]. At first I focused too much on why my design was technically cleaner. The conversation improved when I realized we were not really arguing about technology—we were assigning different weights to risk. We made those assumptions explicit, used [evidence, prototype, or decision criteria], and chose [final approach]. I changed [part of your proposal] because they surfaced a risk I had undervalued. Since then, when capable engineers disagree, I first ask what each person is optimizing for.',
    followUp: 'What would you have done if the evidence remained inconclusive?',
    placeholders: ['Architecture decision', 'Both options and risks', 'Decision method', 'Outcome'],
  },
  {
    id: 'changed-your-mind',
    category: 'collaboration',
    question: 'Describe a technical decision where you changed your mind.',
    suggestedSeconds: 90,
    keyBeats: [
      'Original position',
      'New evidence',
      'Why it mattered',
      'How you communicated the change',
      'Result',
    ],
    sampleResponse:
      'I initially advocated for [original approach] because [reasonable rationale]. During [design review, prototype, or production observation], we learned [new evidence]. That evidence changed the tradeoff: the approach was elegant in one dimension but introduced [operational, customer, or delivery risk]. I told the team explicitly that my recommendation had changed and why, then helped move us toward [revised approach]. The result was [outcome]. I do not see changing a position as losing an argument; the goal is to make the best decision with the evidence we have now.',
    followUp: 'How do you keep conviction from turning into attachment to your own idea?',
    placeholders: ['Original approach', 'New evidence', 'Revised approach', 'Result'],
  },
  {
    id: 'quality-vs-delivery',
    category: 'collaboration',
    question: 'How do you balance engineering quality with delivery pressure?',
    suggestedSeconds: 75,
    keyBeats: [
      'Quality is risk-specific',
      'Protect irreversible/high-impact areas',
      'Make debt explicit',
      'Define follow-up ownership',
    ],
    sampleResponse:
      'I avoid treating quality and speed as opposite ends of one slider. I first ask what kind of failure we would be accepting. In a payment state transition, authorization boundary, or destructive migration, I protect correctness even under pressure. In a reversible presentation detail, I may deliberately choose a simpler first version. The important part is making that decision explicit: what are we deferring, what could go wrong, how will we observe it, and who owns the follow-up? That lets the team move quickly without quietly converting urgency into unmanaged risk.',
    followUp: 'Tell me about a time you intentionally accepted technical debt.',
  },
  {
    id: 'hardest-problem',
    category: 'reliability',
    question: 'What is the hardest technical problem you have solved?',
    suggestedSeconds: 120,
    keyBeats: [
      'Scale and stakes',
      'Misleading initial model',
      'Systematic investigation',
      'Root cause and fix',
      'Preventive improvement',
    ],
    sampleResponse:
      'One of the harder problems I handled at Capital One was difficult not because of one algorithm, but because it involved real users, several dependencies, and meaningful failure. [Briefly describe the system and symptom without confidential detail.] What looked like [initial explanation] turned out to involve [surprising cause]. After eliminating the obvious possibilities, I stopped treating it as an isolated bug and traced the system end to end using [logs, metrics, reproduction, and dependency analysis]. We found [root cause] and I implemented [solution]. The part I am proudest of is [alert, test, or architectural safeguard] we added afterward. It changed the question I ask during incidents from only “How do we fix this?” to “Why could the system fail this way without telling us?”',
    followUp: 'What signal would have shortened that investigation the most?',
    placeholders: [
      'System and symptom',
      'Initial explanation',
      'Root cause',
      'Your actions',
      'Outcome and safeguard',
    ],
  },
  {
    id: 'production-debugging',
    category: 'reliability',
    question: 'Tell me about a production issue you debugged.',
    suggestedSeconds: 120,
    keyBeats: [
      'Observable symptom',
      'Expected versus actual behavior',
      'Evidence-led investigation',
      'Verification',
      'System improvement',
    ],
    sampleResponse:
      'Production teaches you quickly that the system does not care what your mental model of it is. We saw [customer-visible symptom]. Based on the architecture, we expected [expected behavior], but the evidence contradicted us. I worked backward from what we could observe—[logs, metrics, traces, reproduction]—rather than what we believed should happen. We traced it to [root cause], implemented [fix], and verified recovery through [specific signal]. I did not want the outcome to be only that the incident ended, so we also added [test, alert, instrumentation, or runbook]. Fixing the bug was step one; making the system easier for the next engineer to understand was part of the fix.',
    followUp: 'How did you communicate status while the incident was active?',
    placeholders: [
      'Customer-visible symptom',
      'Evidence trail',
      'Root cause and fix',
      'Verification',
      'Preventive change',
    ],
  },
  {
    id: 'external-service-failure',
    category: 'reliability',
    question: 'How do you handle an external-service failure?',
    suggestedSeconds: 90,
    keyBeats: [
      'Classify failure',
      'Bounded retry policy',
      'Idempotency',
      'Observability and degradation',
      'Unknown outcome handling',
    ],
    sampleResponse:
      'I first classify the failure because a timeout, rate limit, authentication error, validation error, and server error should not all be retried. For transient failures I use bounded retries with exponential backoff and jitter. Mutations need idempotency so retrying cannot duplicate an operation. I define timeouts, instrument the dependency, and consider circuit breaking or graceful degradation based on how critical it is. For payments, the hardest case is a timeout after the external system may have processed the request. I would represent that operation as pending or unknown, reconcile with the authoritative system, and only then show the customer a definitive result. The failure experience is part of the product.',
    followUp: 'When would you choose not to retry a transient-looking failure?',
  },
  {
    id: 'payment-ambiguity',
    category: 'reliability',
    question: 'How do you prevent duplicate or ambiguous payment operations?',
    suggestedSeconds: 90,
    keyBeats: [
      'Client-generated idempotency key',
      'Durable state machine',
      'Authoritative reconciliation',
      'Honest UI states',
      'Auditability',
    ],
    sampleResponse:
      'I would give each customer intent a stable idempotency key and persist the operation before calling the downstream provider. The backend would enforce that the same key cannot create a second logical payment and would model explicit states such as initiated, pending, confirmed, failed, and requires reconciliation. If our request times out, we would not infer that the payment failed. A reconciliation process would query or consume events from the authoritative provider and move the operation forward safely. The UI would communicate pending rather than false certainty, and every transition would be auditable. That protects both financial correctness and customer trust.',
    followUp: 'What happens if the provider does not support idempotency?',
  },
  {
    id: 'transaction-api',
    category: 'architecture',
    question: 'Design an API between a transaction UI and its backend.',
    suggestedSeconds: 120,
    keyBeats: [
      'Clarify user job',
      'UI states and operations',
      'BFF boundary',
      'Auth and versioning',
      'Idempotent mutations',
      'Ambiguity represented explicitly',
    ],
    sampleResponse:
      'Before choosing endpoints, I would clarify what the customer is trying to do and what the UI must display. For a transaction view, I would list the read model, allowed actions, and states including loading, partial data, failure, pending, and retry. I would likely use a BFF or API layer so the client does not need to understand downstream topology. The contract should be explicit and versionable, and every operation authenticated and authorized. Mutations would accept an idempotency key. Most importantly, the response model must distinguish a definite failure from an unknown outcome. A timeout does not prove a payment failed, and the UI contract should not turn downstream ambiguity into incorrect certainty.',
    followUp:
      'Would you use polling, server-sent events, or webhooks to update a pending transaction?',
  },
  {
    id: 'frontend-performance',
    category: 'architecture',
    question: 'How do you approach frontend performance?',
    suggestedSeconds: 75,
    keyBeats: [
      'Measure the user-visible problem',
      'Separate load and interaction latency',
      'Inspect browser and network',
      'Prioritize by experience',
      'Verify impact',
    ],
    sampleResponse:
      'I start with measurement because “the app feels slow” can mean slow initial load, delayed interaction, unnecessary rendering, network wait, or main-thread work. Once I know what the customer is experiencing, I work backward. On the client I inspect render frequency, component boundaries, bundle and asset loading, caching, and expensive work. Then I cross the network boundary because sometimes the best frontend optimization is changing the API shape or request sequence. I define the user-facing metric first, change the most likely constraint, and measure again. The goal is not an isolated function becoming forty milliseconds faster; it is the interaction the customer was waiting for feeling immediate.',
    followUp: 'Which metrics would you use for an authenticated transaction dashboard?',
  },
  {
    id: 'test-payments',
    category: 'architecture',
    question: 'How would you test a payment-related system?',
    suggestedSeconds: 90,
    keyBeats: [
      'Layered test strategy',
      'State transitions and contracts',
      'Small critical E2E set',
      'Failure injection',
      'Recovery across sessions',
    ],
    sampleResponse:
      'I would test in layers. Unit tests would cover business rules and state transitions because they are fast and precise. Integration tests would cover API contracts, persistence, and provider boundaries. A smaller end-to-end set would protect customer journeys we cannot break. For payments I would invest heavily in interruption cases: double submission, network loss, a timeout after downstream success, delayed events, and the user closing and reopening the app. I would also test reconciliation and idempotency under concurrency. Happy paths are usually straightforward; the interesting bugs live where reality interrupts them, and I want our tests to make those moments boring.',
    followUp: 'How would you make those failure scenarios deterministic in CI?',
  },
  {
    id: 'design-sway',
    category: 'architecture',
    question: 'Design the high-level architecture for Sway.',
    suggestedSeconds: 120,
    keyBeats: [
      'Clarify scale and core journeys',
      'Client, API, auth, metadata, object storage',
      'Direct resumable uploads',
      'Video processing states',
      'Offline and failure behavior',
    ],
    sampleResponse:
      'I would begin with the core journey: capture or import a class video, organize it, and practice clips reliably on mobile. The clients would authenticate with an API responsible for authorization and metadata, while large media goes directly to object storage through short-lived signed uploads rather than through application servers. A durable job would handle any server-side video processing and expose explicit processing states. Relational or document storage would hold users, classes, clips, and entitlements; object storage would hold media. The client should work locally during capture and practice, sync metadata when possible, resume interrupted uploads, and never lose the original because processing failed. I would add observability around upload success, processing latency, playback failures, and storage cost before optimizing for hypothetical scale.',
    followUp: 'How would you protect private video while still using a CDN?',
  },
  {
    id: 'react-to-vue',
    category: 'team-fit',
    question: 'How do your React and Next.js skills transfer to Vue?',
    suggestedSeconds: 60,
    keyBeats: [
      'Acknowledge syntax gap',
      'Name transferable concepts',
      'Give learning approach',
      'Show curiosity without framework tribalism',
    ],
    sampleResponse:
      'Most of my recent web work has been React and Next.js, so I would have Vue syntax and conventions to learn. I would not pretend the frameworks are identical. The underlying work does transfer directly: component composition, reactive state, routing, asynchronous data, API contracts, accessibility, performance, and testing. My approach would be to learn this team’s established patterns first, then contribute within them rather than importing React habits by default. I’m especially interested in understanding why Vue fits the broader WPC architecture, because that context is more valuable than memorizing syntax in isolation.',
    followUp: 'What differences between Vue and React would you investigate first?',
  },
  {
    id: 'vue-vs-next',
    category: 'team-fit',
    question: 'Why might a payments team choose Vue instead of Next.js?',
    suggestedSeconds: 90,
    keyBeats: [
      'Not an Apple-wide assumption',
      'Vue and Next are different scopes',
      'Clear service boundary',
      'Authenticated app needs',
      'Maturity and migration cost',
    ],
    sampleResponse:
      'I would avoid assuming Apple made one company-wide framework choice. For this team, Vue may fit an architecture where the browser is intentionally a client of independently owned APIs and services. Next.js is a broader full-stack React framework whose server rendering, server components, and integrated deployment model are valuable when those solve the product’s needs. An authenticated payments application may benefit more from explicit client-service boundaries than SEO or framework-owned backend behavior. The choice may also reflect mature components, accessibility tooling, build pipelines, and operational knowledge. In a long-lived financial system, replacing a working ecosystem because another framework is popular is rarely a compelling trade.',
    followUp: 'Under what conditions would Next.js become the better choice?',
  },
  ...technicalFundamentalsCards,
  ...paymentReliabilityCards,
]).map((card) => ({ ...card, beatDetails: beatDetails[card.id] }))

export function categoryFor(card: InterviewCard) {
  return categories.find((category) => category.id === card.category)!
}
