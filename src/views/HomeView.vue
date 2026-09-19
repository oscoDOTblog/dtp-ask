<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { categories, categoryFor, interviewCards } from '@/data/deck'
import {
  loadPracticeState,
  pacingNote,
  savePracticeState,
  weakCardIds,
  weakSelfReviewCardIds,
  withConfidence,
  wordsPerMinute,
} from '@/services/practice'
import type {
  AnswerEvaluation,
  Attempt,
  CategoryId,
  Confidence,
  InterviewCard,
  SelfReview,
} from '@/types/interview'

const authReady = ref(false)
const authenticated = ref(false)
const aiAvailable = ref(false)
const password = ref('')
const loginError = ref('')
const loginBusy = ref(false)
const screen = ref<'library' | 'practice'>('library')
const practiceState = ref(loadPracticeState())
const sessionCards = ref<InterviewCard[]>([])
const cardIndex = ref(0)
const recording = ref(false)
const evaluating = ref(false)
const elapsedSeconds = ref(0)
const statusMessage = ref('')
const errorMessage = ref('')
const transcript = ref('')
const currentAttempt = ref<Attempt | null>(null)
const selfReview = ref<SelfReview | null>(null)
const selfTiming = ref(false)
const showSample = ref(false)
const editingTranscript = ref(false)

let mediaRecorder: MediaRecorder | null = null
let mediaStream: MediaStream | null = null
let chunks: Blob[] = []
let recordingTimer: number | undefined

const activeCard = computed(() => sessionCards.value[cardIndex.value])
const activeCategory = computed(() =>
  activeCard.value ? categoryFor(activeCard.value) : categories[0],
)
const completedCardIds = computed(
  () =>
    new Set([
      ...practiceState.value.attempts.map((item) => item.cardId),
      ...practiceState.value.selfReviews.map((item) => item.cardId),
    ]),
)
const readyCount = computed(() => {
  const latest = new Map<string, Attempt>()
  for (const attempt of practiceState.value.attempts)
    if (!latest.has(attempt.cardId)) latest.set(attempt.cardId, attempt)
  const latestSelf = new Map<string, SelfReview>()
  for (const review of practiceState.value.selfReviews)
    if (!latestSelf.has(review.cardId)) latestSelf.set(review.cardId, review)
  return (
    [...latest.values()].filter((attempt) => attempt.confidence === 'ready').length +
    [...latestSelf.values()].filter((review) => review.confidence === 'ready').length
  )
})
const weakCount = computed(
  () =>
    new Set([
      ...weakCardIds(practiceState.value.attempts),
      ...weakSelfReviewCardIds(practiceState.value.selfReviews),
    ]).size,
)
const recentAttempts = computed(() => practiceState.value.attempts.slice(0, 4))
const progressPercent = computed(() =>
  sessionCards.value.length ? ((cardIndex.value + 1) / sessionCards.value.length) * 100 : 0,
)
const timerText = computed(
  () =>
    `${Math.floor(elapsedSeconds.value / 60)}:${String(elapsedSeconds.value % 60).padStart(2, '0')}`,
)
const pace = computed(() =>
  currentAttempt.value ? pacingNote(currentAttempt.value.wordsPerMinute) : '',
)

watch(practiceState, (state) => savePracticeState(state), { deep: true })
onBeforeUnmount(stopRecorderResources)
onMounted(async () => {
  try {
    const response = await fetch('/api/session', { credentials: 'same-origin' })
    const body = await response.json()
    authenticated.value = response.ok && body.authenticated === true
    aiAvailable.value = body.aiAvailable === true
  } catch {
    authenticated.value = false
  } finally {
    authReady.value = true
  }
})

async function logIn() {
  loginError.value = ''
  loginBusy.value = true
  try {
    const response = await fetch('/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ password: password.value }),
    })
    const body = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(body.error || 'Could not unlock the practice room.')
    authenticated.value = true
    aiAvailable.value = body.aiAvailable === true
    password.value = ''
  } catch (error) {
    loginError.value =
      error instanceof Error ? error.message : 'Could not unlock the practice room.'
  } finally {
    loginBusy.value = false
  }
}

async function logOut() {
  await fetch('/api/session', { method: 'DELETE', credentials: 'same-origin' }).catch(
    () => undefined,
  )
  authenticated.value = false
  screen.value = 'library'
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[target]] = [copy[target]!, copy[index]!]
  }
  return copy
}

function startSession(category: CategoryId | 'mixed') {
  practiceState.value.lastCategory = category
  const availableCards =
    category === 'mixed'
      ? interviewCards
      : interviewCards.filter((card) => card.category === category)
  const orderedCards = practiceState.value.preferences.shuffleQuestions
    ? shuffle(availableCards)
    : [...availableCards]
  sessionCards.value =
    practiceState.value.preferences.sessionSize === 'all'
      ? orderedCards
      : orderedCards.slice(0, practiceState.value.preferences.sessionSize)
  openCard(0)
  screen.value = 'practice'
}

function practiceWeakCards() {
  const ids = new Set([
    ...weakCardIds(practiceState.value.attempts),
    ...weakSelfReviewCardIds(practiceState.value.selfReviews),
  ])
  const cards = interviewCards.filter((card) => ids.has(card.id))
  if (!cards.length) {
    statusMessage.value =
      'No weak cards yet. Rate an answer “Needs work” or score below 70 to add it.'
    return
  }
  sessionCards.value = shuffle(cards)
  openCard(0)
  screen.value = 'practice'
}

function openCard(index: number) {
  stopRecorderResources()
  cardIndex.value = index
  elapsedSeconds.value = 0
  errorMessage.value = ''
  statusMessage.value = ''
  transcript.value = ''
  currentAttempt.value = null
  selfReview.value = null
  selfTiming.value = false
  showSample.value = false
  editingTranscript.value = false
  nextTick(() => document.querySelector<HTMLElement>('.question-card h1')?.focus())
}

function startSelfReview() {
  elapsedSeconds.value = 0
  selfTiming.value = true
  statusMessage.value = 'Answer aloud. Stop when you are ready to compare.'
  recordingTimer = window.setInterval(() => {
    elapsedSeconds.value += 1
    if (elapsedSeconds.value >= 120) revealSelfReview()
  }, 1000)
}

function revealSelfReview() {
  if (!activeCard.value) return
  window.clearInterval(recordingTimer)
  selfTiming.value = false
  const review: SelfReview = {
    id: crypto.randomUUID(),
    cardId: activeCard.value.id,
    createdAt: new Date().toISOString(),
    durationSeconds: Math.max(1, elapsedSeconds.value),
  }
  practiceState.value.selfReviews = [review, ...practiceState.value.selfReviews]
  selfReview.value = review
  showSample.value = false
  statusMessage.value = 'Self-review guide ready.'
}

function goToNext() {
  if (cardIndex.value < sessionCards.value.length - 1) openCard(cardIndex.value + 1)
  else screen.value = 'library'
}

function supportedMimeType() {
  return (
    ['audio/webm;codecs=opus', 'audio/mp4', 'audio/webm'].find((type) =>
      MediaRecorder.isTypeSupported(type),
    ) ?? ''
  )
}

async function startRecording() {
  errorMessage.value = ''
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    errorMessage.value =
      'This browser cannot record audio. Try a current version of Safari, Chrome, or Edge.'
    return
  }
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    chunks = []
    const mimeType = supportedMimeType()
    mediaRecorder = new MediaRecorder(mediaStream, mimeType ? { mimeType } : undefined)
    mediaRecorder.addEventListener('dataavailable', (event) => {
      if (event.data.size) chunks.push(event.data)
    })
    mediaRecorder.addEventListener('stop', submitRecording, { once: true })
    mediaRecorder.start(500)
    recording.value = true
    elapsedSeconds.value = 0
    recordingTimer = window.setInterval(() => {
      elapsedSeconds.value += 1
      if (elapsedSeconds.value >= 120) stopRecording()
    }, 1000)
  } catch (error) {
    errorMessage.value =
      error instanceof DOMException && error.name === 'NotAllowedError'
        ? 'Microphone access is blocked. Allow it in your browser settings, then try again.'
        : 'The microphone could not be started. Check that another app is not using it.'
    stopRecorderResources()
  }
}

function stopRecording() {
  if (mediaRecorder?.state === 'recording') {
    recording.value = false
    window.clearInterval(recordingTimer)
    mediaRecorder.stop()
  }
}

function stopRecorderResources() {
  window.clearInterval(recordingTimer)
  recording.value = false
  selfTiming.value = false
  mediaStream?.getTracks().forEach((track) => track.stop())
  mediaStream = null
  mediaRecorder = null
}

async function submitRecording() {
  const recorder = mediaRecorder
  const blob = new Blob(chunks, { type: recorder?.mimeType || 'audio/webm' })
  stopRecorderResources()
  if (!activeCard.value || !blob.size) {
    errorMessage.value = 'No audio was captured. Try recording again.'
    return
  }
  const form = new FormData()
  const extension = blob.type.includes('mp4') ? 'm4a' : blob.type.includes('ogg') ? 'ogg' : 'webm'
  form.append('audio', blob, `answer.${extension}`)
  form.append(
    'question',
    activeCard.value.codeExample
      ? `${activeCard.value.question}\n${activeCard.value.codeExample}`
      : activeCard.value.question,
  )
  form.append('category', activeCard.value.category)
  form.append('expectedBeats', JSON.stringify(activeCard.value.keyBeats))
  form.append('followUp', activeCard.value.followUp)
  form.append('durationSeconds', String(Math.max(1, elapsedSeconds.value)))
  await requestEvaluation(form, elapsedSeconds.value)
}

async function regradeTranscript() {
  if (!activeCard.value || !transcript.value.trim()) return
  const duration = currentAttempt.value?.durationSeconds || elapsedSeconds.value || 1
  await requestEvaluation(
    {
      transcript: transcript.value.trim(),
      question: activeCard.value.codeExample
        ? `${activeCard.value.question}\n${activeCard.value.codeExample}`
        : activeCard.value.question,
      category: activeCard.value.category,
      expectedBeats: activeCard.value.keyBeats,
      followUp: activeCard.value.followUp,
      durationSeconds: duration,
    },
    duration,
  )
  editingTranscript.value = false
}

async function requestEvaluation(payload: FormData | object, duration: number) {
  evaluating.value = true
  errorMessage.value = ''
  statusMessage.value = 'Turning your answer into focused coaching…'
  try {
    const response = await fetch('/api/evaluate', {
      method: 'POST',
      credentials: 'same-origin',
      headers: payload instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    })
    const body = (await response.json().catch(() => ({}))) as {
      error?: string
      transcript?: string
      evaluation?: AnswerEvaluation
    }
    if (response.status === 401) authenticated.value = false
    if (!response.ok || !body.transcript || !body.evaluation)
      throw new Error(body.error || 'Feedback could not be generated.')
    transcript.value = body.transcript
    const attempt: Attempt = {
      id: crypto.randomUUID(),
      cardId: activeCard.value!.id,
      createdAt: new Date().toISOString(),
      transcript: body.transcript,
      durationSeconds: duration,
      wordsPerMinute: wordsPerMinute(body.transcript, duration),
      evaluation: body.evaluation,
      confidence: currentAttempt.value?.confidence,
    }
    practiceState.value.attempts = [attempt, ...practiceState.value.attempts]
    currentAttempt.value = attempt
    showSample.value = false
    statusMessage.value = 'Coaching ready.'
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : 'Feedback could not be generated.'
    statusMessage.value = ''
  } finally {
    evaluating.value = false
  }
}

function setConfidence(confidence: Confidence) {
  if (currentAttempt.value) {
    currentAttempt.value = { ...currentAttempt.value, confidence }
    practiceState.value.attempts = withConfidence(
      practiceState.value.attempts,
      currentAttempt.value.id,
      confidence,
    )
  } else if (selfReview.value) {
    selfReview.value = { ...selfReview.value, confidence }
    practiceState.value.selfReviews = practiceState.value.selfReviews.map((review) =>
      review.id === selfReview.value!.id ? { ...review, confidence } : review,
    )
  }
}

function removeAttempt(id: string) {
  practiceState.value.attempts = practiceState.value.attempts.filter((attempt) => attempt.id !== id)
}
function clearHistory() {
  if (
    window.confirm('Clear every saved transcript, score, and confidence rating on this device?')
  ) {
    practiceState.value.attempts = []
    practiceState.value.selfReviews = []
    statusMessage.value = 'Practice history cleared.'
  }
}
function cardTitle(id: string) {
  return interviewCards.find((card) => card.id === id)?.question ?? 'Interview question'
}
function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(value),
  )
}
</script>

<template>
  <div v-if="!authReady" class="loading-screen" aria-live="polite">
    <span class="brand-mark">O</span>
    <p>Preparing the room…</p>
  </div>
  <main v-else-if="!authenticated" class="login-page">
    <section class="login-panel" aria-labelledby="login-title">
      <div class="login-copy">
        <span class="brand-mark">O</span>
        <p class="context-line">Private interview practice</p>
        <h1 id="login-title">Walk in with<br />your stories ready.</h1>
        <p class="login-intro">
          Twenty focused prompts. Spoken practice. Specific coaching for the moments that matter.
        </p>
      </div>
      <form class="unlock-form" @submit.prevent="logIn">
        <label for="password">Practice room password</label>
        <div class="input-row">
          <input
            id="password"
            v-model="password"
            type="password"
            autocomplete="current-password"
            autofocus
            required
          />
          <button class="button button--light" type="submit" :disabled="loginBusy">
            {{ loginBusy ? 'Unlocking…' : 'Enter' }}
          </button>
        </div>
        <p v-if="loginError" class="form-error" role="alert">{{ loginError }}</p>
        <p class="privacy-note">Your recordings are discarded after feedback is generated.</p>
      </form>
    </section>
    <aside class="login-aside">
      <p>Do not memorize scripts.</p>
      <p>Remember the decisions.</p>
      <p>Make the evidence concrete.</p>
    </aside>
  </main>

  <div v-else class="app-shell">
    <header class="topbar">
      <button class="wordmark" type="button" @click="screen = 'library'">
        <span class="brand-mark">O</span><span>Interview Room</span>
      </button>
      <div class="topbar-actions">
        <span class="privacy-pill"
          ><i></i>{{ aiAvailable ? 'Audio never saved' : 'Self-review mode' }}</span
        ><RouterLink class="text-button" to="/settings">Settings</RouterLink
        ><button class="text-button" @click="logOut">Lock room</button>
      </div>
    </header>

    <main v-if="screen === 'library'" class="library">
      <section class="library-intro">
        <div>
          <p class="context-line">Apple · Wallet, Payments & Commerce</p>
          <h1>Practice the answer.<br />Keep the thinking.</h1>
        </div>
        <p>
          Speak naturally, then use the critique to sharpen your evidence—not to replace your voice.
        </p>
      </section>
      <section class="overview-strip" aria-label="Practice progress">
        <div>
          <strong>{{ completedCardIds.size }}</strong
          ><span>of 20 attempted</span>
        </div>
        <div>
          <strong>{{ readyCount }}</strong
          ><span>answers ready</span>
        </div>
        <div>
          <strong>{{ weakCount }}</strong
          ><span>to revisit</span>
        </div>
        <button class="button button--ink" @click="startSession('mixed')">
          Start mixed practice
        </button>
      </section>
      <section class="deck-section" aria-labelledby="choose-heading">
        <div class="section-heading">
          <h2 id="choose-heading">Choose a line of questioning</h2>
          <button class="text-button" @click="practiceWeakCards">Practice weak answers</button>
        </div>
        <div class="category-list">
          <button
            v-for="(category, index) in categories"
            :key="category.id"
            class="category-row"
            :style="{ '--accent': category.accent }"
            @click="startSession(category.id)"
          >
            <span class="category-index">{{ String(index + 1).padStart(2, '0') }}</span
            ><span class="category-name">{{ category.name }}</span>
            <span class="category-description">{{ category.description }}</span
            ><span class="category-count"
              >{{
                interviewCards.filter((card) => card.category === category.id).length
              }}
              prompts</span
            >
            <svg viewBox="0 0 24 24"><path d="M5 12h13m-5-5 5 5-5 5" /></svg>
          </button>
        </div>
      </section>
      <section v-if="recentAttempts.length" class="history-section">
        <div class="section-heading">
          <h2>Recent attempts</h2>
          <button class="text-button text-button--danger" @click="clearHistory">
            Clear history
          </button>
        </div>
        <div class="attempt-list">
          <article v-for="attempt in recentAttempts" :key="attempt.id" class="attempt-row">
            <div>
              <p>{{ cardTitle(attempt.cardId) }}</p>
              <span
                >{{ formatDate(attempt.createdAt) }} · {{ attempt.wordsPerMinute }} words/min</span
              >
            </div>
            <strong>{{ attempt.evaluation.overallScore }}</strong
            ><span class="confidence-label">{{
              attempt.confidence?.replace('-', ' ') || 'unrated'
            }}</span>
            <button
              :aria-label="`Delete attempt for ${cardTitle(attempt.cardId)}`"
              @click="removeAttempt(attempt.id)"
            >
              ×
            </button>
          </article>
        </div>
      </section>
      <p class="live-message" role="status">{{ statusMessage }}</p>
    </main>

    <main v-else class="practice-view">
      <aside class="practice-rail">
        <button class="back-link" @click="screen = 'library'">← All questions</button>
        <div class="rail-position">
          <span>{{ cardIndex + 1 }} / {{ sessionCards.length }}</span>
          <div class="progress-track"><i :style="{ width: `${progressPercent}%` }"></i></div>
        </div>
        <div class="rail-category" :style="{ '--accent': activeCategory?.accent }">
          <i></i><span>{{ activeCategory?.name }}</span>
        </div>
        <div v-if="activeCard && (currentAttempt || selfReview)" class="beat-preview">
          <p>Listen for</p>
          <ul>
            <li v-for="beat in activeCard.keyBeats" :key="beat">{{ beat }}</li>
          </ul>
        </div>
      </aside>
      <section v-if="activeCard" class="practice-stage">
        <article class="question-card">
          <div class="question-meta">
            <span v-if="practiceState.preferences.showTimeTargets"
              >{{ activeCard.suggestedSeconds }} sec target</span
            ><span>{{ activeCategory?.shortName }}</span>
          </div>
          <h1 tabindex="-1">{{ activeCard.question }}</h1>
          <pre
            v-if="activeCard.codeExample"
            class="question-code"
          ><code>{{ activeCard.codeExample }}</code></pre>
          <p class="prompt-note">Take a breath. Lead with the point, then earn it with evidence.</p>
          <div v-if="!currentAttempt && !selfReview" class="recording-zone">
            <div v-if="recording || selfTiming" class="recording-live" aria-live="polite">
              <span class="pulse-dot"></span><strong>{{ timerText }}</strong
              ><span>of 2:00 maximum</span>
            </div>
            <button
              v-if="aiAvailable && !recording"
              class="record-button"
              :disabled="evaluating"
              @click="startRecording"
            >
              <span class="record-disc"></span
              >{{ evaluating ? 'Preparing coaching…' : 'Record answer' }}
            </button>
            <button v-else-if="aiAvailable" class="button button--stop" @click="stopRecording">
              Stop & get feedback
            </button>
            <button
              v-if="!aiAvailable && !selfTiming"
              class="record-button"
              @click="startSelfReview"
            >
              <span class="record-disc record-disc--self"></span>Start answer timer
            </button>
            <button
              v-if="!aiAvailable && selfTiming"
              class="button button--ink"
              @click="revealSelfReview"
            >
              Finish & reveal guide
            </button>
            <p v-if="evaluating" class="working-note">
              Transcribing, then checking your story beats…
            </p>
            <p v-if="!aiAvailable" class="working-note">
              No API key detected. Answer aloud; nothing is recorded or uploaded.
            </p>
          </div>
          <p v-if="errorMessage" class="inline-error" role="alert">{{ errorMessage }}</p>
        </article>

        <Transition name="reveal">
          <section v-if="selfReview" class="feedback-panel self-review-panel">
            <div class="feedback-title-row">
              <div>
                <p class="context-line">Self-review · {{ selfReview.durationSeconds }} seconds</p>
                <h2>Compare your answer with the guide</h2>
              </div>
              <span class="mode-badge">No AI score</span>
            </div>
            <div class="self-review-grid">
              <div>
                <h3>Did you cover these beats?</h3>
                <ul class="check-list">
                  <li v-for="beat in activeCard.keyBeats" :key="beat">{{ beat }}</li>
                </ul>
              </div>
              <div class="follow-up-callout">
                <span>Could you answer the follow-up?</span>
                <p>{{ activeCard.followUp }}</p>
              </div>
            </div>
            <div class="sample-section">
              <button class="sample-toggle" @click="showSample = !showSample">
                {{ showSample ? 'Hide' : 'Reveal' }} sample response
                <span>{{ showSample ? '−' : '+' }}</span>
              </button>
              <p v-if="showSample" class="sample-copy">{{ activeCard.sampleResponse }}</p>
              <div v-if="showSample && activeCard.placeholders?.length" class="placeholder-note">
                Personalize before using: {{ activeCard.placeholders.join(' · ') }}
              </div>
            </div>
            <div class="confidence-section">
              <div>
                <h3>How ready is this answer?</h3>
                <p>Rate the evidence, not your mood.</p>
              </div>
              <div class="confidence-options">
                <button
                  v-for="option in ['needs-work', 'getting-there', 'ready'] as Confidence[]"
                  :key="option"
                  :class="{ selected: selfReview.confidence === option }"
                  @click="setConfidence(option)"
                >
                  {{ option.replace('-', ' ') }}
                </button>
              </div>
            </div>
          </section>
        </Transition>

        <Transition name="reveal"
          ><section v-if="currentAttempt" class="feedback-panel">
            <div class="feedback-title-row">
              <div>
                <p class="context-line">Coaching</p>
                <h2>What landed—and what to sharpen</h2>
              </div>
              <div class="score-seal" aria-label="Overall score">
                <strong>{{ currentAttempt.evaluation.overallScore }}</strong
                ><span>/100</span>
              </div>
            </div>
            <div class="coaching-grid">
              <div class="coaching-block coaching-block--strengths">
                <h3>What worked</h3>
                <ul>
                  <li v-for="item in currentAttempt.evaluation.strengths" :key="item">
                    {{ item }}
                  </li>
                </ul>
              </div>
              <div class="coaching-block">
                <h3>What was missing</h3>
                <ul v-if="currentAttempt.evaluation.missingBeats.length">
                  <li v-for="item in currentAttempt.evaluation.missingBeats" :key="item">
                    {{ item }}
                  </li>
                </ul>
                <p v-else>No essential beats were missing.</p>
              </div>
            </div>
            <div class="priority-note">
              <span>One change for the next pass</span>
              <p>{{ currentAttempt.evaluation.priorityImprovement }}</p>
            </div>
            <div class="outline-block">
              <h3>A cleaner route through the answer</h3>
              <ol>
                <li v-for="item in currentAttempt.evaluation.improvedOutline" :key="item">
                  {{ item }}
                </li>
              </ol>
            </div>
            <details class="transcript-block" :open="editingTranscript">
              <summary>Your transcript · {{ currentAttempt.wordsPerMinute }} words/min</summary>
              <p class="pace-note">{{ pace }}</p>
              <textarea
                v-if="editingTranscript"
                v-model="transcript"
                aria-label="Edit transcript"
                rows="8"
              ></textarea>
              <p v-else class="transcript-copy">{{ transcript }}</p>
              <button
                v-if="!editingTranscript"
                class="text-button"
                @click="editingTranscript = true"
              >
                Correct transcript
              </button>
              <button
                v-else
                class="button button--ink button--small"
                :disabled="evaluating"
                @click="regradeTranscript"
              >
                {{ evaluating ? 'Regrading…' : 'Save & regrade' }}
              </button>
            </details>
            <details class="rubric-block">
              <summary>View rubric</summary>
              <div class="rubric-grid">
                <div
                  v-for="(dimension, name) in currentAttempt.evaluation.dimensions"
                  :key="name"
                  class="rubric-item"
                >
                  <div>
                    <span>{{
                      activeCard.category === 'technical-fundamentals' && name === 'ownership'
                        ? 'reasoning'
                        : name
                    }}</span
                    ><strong>{{ dimension.score }}/5</strong>
                  </div>
                  <p>{{ dimension.justification }}</p>
                </div>
              </div>
            </details>
            <div class="follow-up-callout">
              <span>Expect the follow-up</span>
              <p>{{ currentAttempt.evaluation.followUpQuestion }}</p>
            </div>
            <div class="sample-section">
              <button class="sample-toggle" @click="showSample = !showSample">
                {{ showSample ? 'Hide' : 'Compare with' }} sample response
                <span>{{ showSample ? '−' : '+' }}</span>
              </button>
              <p v-if="showSample" class="sample-copy">{{ activeCard.sampleResponse }}</p>
              <div v-if="showSample && activeCard.placeholders?.length" class="placeholder-note">
                Personalize before using: {{ activeCard.placeholders.join(' · ') }}
              </div>
            </div>
            <div class="confidence-section">
              <div>
                <h3>How did that feel?</h3>
                <p>Confidence is separate from the AI score.</p>
              </div>
              <div class="confidence-options">
                <button
                  v-for="option in ['needs-work', 'getting-there', 'ready'] as Confidence[]"
                  :key="option"
                  :class="{ selected: currentAttempt.confidence === option }"
                  @click="setConfidence(option)"
                >
                  {{ option.replace('-', ' ') }}
                </button>
              </div>
            </div>
          </section></Transition
        >
        <footer class="practice-footer">
          <button class="text-button" :disabled="cardIndex === 0" @click="openCard(cardIndex - 1)">
            Previous</button
          ><span aria-live="polite">{{ statusMessage }}</span>
          <div>
            <button
              v-if="currentAttempt || selfReview"
              class="text-button"
              @click="openCard(cardIndex)"
            >
              Try again</button
            ><button class="button button--ink button--small" @click="goToNext">
              {{ cardIndex === sessionCards.length - 1 ? 'Finish session' : 'Next question' }}
            </button>
          </div>
        </footer>
      </section>
    </main>
  </div>
</template>
