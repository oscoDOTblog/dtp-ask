<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { categories, interviewCards } from '@/data/deck'
import { emptyPracticeState, loadPracticeState, savePracticeState } from '@/services/practice'
import type { CategoryId, PracticeState } from '@/types/interview'

const state = ref<PracticeState>(loadPracticeState())
const query = ref('')
const category = ref<CategoryId | 'all'>('all')
const showAnswers = ref(true)
const resetMessage = ref('')

const completedIds = computed(
  () =>
    new Set([
      ...state.value.attempts.map((attempt) => attempt.cardId),
      ...state.value.selfReviews.map((review) => review.cardId),
    ]),
)
const filteredCards = computed(() => {
  const term = query.value.trim().toLowerCase()
  return interviewCards.filter((card) => {
    const inCategory = category.value === 'all' || card.category === category.value
    const matches =
      !term ||
      [card.question, card.sampleResponse, ...card.keyBeats].some((value) =>
        value.toLowerCase().includes(term),
      )
    return inCategory && matches
  })
})
const averageScore = computed(() => {
  if (!state.value.attempts.length) return null
  const total = state.value.attempts.reduce(
    (sum, attempt) => sum + attempt.evaluation.overallScore,
    0,
  )
  return Math.round(total / state.value.attempts.length)
})

watch(state, (value) => savePracticeState(value), { deep: true })

function resetEverything() {
  if (
    !window.confirm(
      'Start over completely? This removes every transcript, score, self-rating, and preference stored on this device.',
    )
  ) {
    return
  }
  state.value = emptyPracticeState()
  resetMessage.value = 'Everything has been reset. Your next session will start fresh.'
}

function exportHistory() {
  const payload = JSON.stringify(
    { exportedAt: new Date().toISOString(), practice: state.value },
    null,
    2,
  )
  const url = URL.createObjectURL(new Blob([payload], { type: 'application/json' }))
  const link = document.createElement('a')
  link.href = url
  link.download = `interview-room-${new Date().toISOString().slice(0, 10)}.json`
  link.click()
  URL.revokeObjectURL(url)
}

function printGuide() {
  window.print()
}
</script>

<template>
  <div class="settings-shell">
    <header class="topbar settings-topbar">
      <RouterLink class="wordmark" to="/">
        <span class="brand-mark">O</span><span>Interview Room</span>
      </RouterLink>
      <RouterLink class="text-button" to="/">Back to practice</RouterLink>
    </header>

    <main class="settings-page">
      <header class="settings-hero">
        <p class="context-line">Settings & study guide</p>
        <h1>Shape the session.<br />Review the whole story.</h1>
        <p>Preferences and practice history stay in this browser.</p>
      </header>

      <section class="settings-summary" aria-label="Progress summary">
        <div>
          <strong>{{ completedIds.size }}</strong
          ><span>questions attempted</span>
        </div>
        <div>
          <strong>{{ state.attempts.length + state.selfReviews.length }}</strong
          ><span>total passes</span>
        </div>
        <div>
          <strong>{{ averageScore ?? '—' }}</strong
          ><span>average AI score</span>
        </div>
      </section>

      <div class="settings-columns">
        <section class="settings-block" aria-labelledby="session-heading">
          <h2 id="session-heading">Practice defaults</h2>
          <div class="setting-row">
            <div>
              <label for="session-size">Questions per session</label>
              <p>Applies to category and mixed practice.</p>
            </div>
            <select id="session-size" v-model="state.preferences.sessionSize">
              <option :value="5">5 questions</option>
              <option :value="10">10 questions</option>
              <option value="all">All available</option>
            </select>
          </div>
          <label class="setting-row setting-toggle">
            <div>
              <span>Shuffle questions</span>
              <p>Change the order each time a session begins.</p>
            </div>
            <input v-model="state.preferences.shuffleQuestions" type="checkbox" role="switch" />
          </label>
          <label class="setting-row setting-toggle">
            <div>
              <span>Show suggested time</span>
              <p>Display the answer-length target beside each prompt.</p>
            </div>
            <input v-model="state.preferences.showTimeTargets" type="checkbox" role="switch" />
          </label>
        </section>

        <section class="settings-block" aria-labelledby="data-heading">
          <h2 id="data-heading">Your practice data</h2>
          <button class="utility-row" type="button" @click="exportHistory">
            <span
              ><strong>Export history</strong
              ><small>Download transcripts, scores, and ratings as JSON.</small></span
            ><b>Download</b>
          </button>
          <button class="utility-row" type="button" @click="printGuide">
            <span
              ><strong>Print study guide</strong
              ><small>Print or save the complete question bank as PDF.</small></span
            ><b>Print</b>
          </button>
          <button class="utility-row utility-row--danger" type="button" @click="resetEverything">
            <span
              ><strong>Restart everything</strong
              ><small>Remove all local progress and restore defaults.</small></span
            ><b>Reset</b>
          </button>
          <p class="reset-message" role="status">{{ resetMessage }}</p>
        </section>
      </div>

      <section class="question-bank" aria-labelledby="bank-heading">
        <div class="bank-heading">
          <div>
            <p class="context-line">All 20 prompts</p>
            <h2 id="bank-heading">Question & answer library</h2>
          </div>
          <button class="text-button" type="button" @click="showAnswers = !showAnswers">
            {{ showAnswers ? 'Collapse answers' : 'Expand all answers' }}
          </button>
        </div>
        <div class="bank-tools">
          <label
            ><span class="sr-only">Search questions and answers</span
            ><input
              v-model="query"
              type="search"
              placeholder="Search questions, beats, and answers"
          /></label>
          <select v-model="category" aria-label="Filter by category">
            <option value="all">All categories</option>
            <option v-for="item in categories" :key="item.id" :value="item.id">
              {{ item.name }}
            </option>
          </select>
          <span>{{ filteredCards.length }} shown</span>
        </div>
        <div class="study-list">
          <details
            v-for="(card, index) in filteredCards"
            :key="card.id"
            :open="showAnswers"
            class="study-card"
          >
            <summary>
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
              <div>
                <small>{{ categories.find((item) => item.id === card.category)?.name }}</small>
                <h3>{{ card.question }}</h3>
                <pre
                  v-if="card.codeExample"
                  class="question-code"
                ><code>{{ card.codeExample }}</code></pre>
              </div>
              <b>{{ completedIds.has(card.id) ? 'Practiced' : 'New' }}</b>
            </summary>
            <div class="study-answer">
              <div>
                <h4>Key beats</h4>
                <ul>
                  <li v-for="beat in card.keyBeats" :key="beat">{{ beat }}</li>
                </ul>
              </div>
              <div>
                <h4>Sample response</h4>
                <p>{{ card.sampleResponse }}</p>
                <p class="study-followup"><strong>Likely follow-up:</strong> {{ card.followUp }}</p>
                <p v-if="card.placeholders?.length" class="placeholder-note">
                  Personalize: {{ card.placeholders.join(' · ') }}
                </p>
              </div>
            </div>
          </details>
        </div>
        <p v-if="!filteredCards.length" class="empty-search">No prompts match that search.</p>
      </section>
    </main>
  </div>
</template>
