<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import questionBank from '@/data/californiaDmvQuestions.json'

type AnswerKey = 'A' | 'B' | 'C' | 'D'
type QuizQuestion = (typeof questionBank.questions)[number]

function shuffleOptions(question: QuizQuestion) {
  const options = Object.entries(question.options).map(([key, text]) => ({
    key: key as AnswerKey,
    text,
  }))
  for (let index = options.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[options[index], options[target]] = [options[target]!, options[index]!]
  }
  return options
}

const questions = ref([...questionBank.questions])
const currentIndex = ref(0)
const displayedOptions = ref(shuffleOptions(questions.value[0]!))
const selectedAnswer = ref<AnswerKey | null>(null)
const submittedAnswer = ref<AnswerKey | null>(null)
const correctCount = ref(0)
const finished = ref(false)

const currentQuestion = computed(() => questions.value[currentIndex.value]!)
const isCorrect = computed(() => submittedAnswer.value === currentQuestion.value.correct_answer)
const progress = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100)

function shuffleRemaining() {
  const completed = questions.value.slice(0, currentIndex.value + 1)
  const remaining = questions.value.slice(currentIndex.value + 1)
  for (let index = remaining.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1))
    ;[remaining[index], remaining[target]] = [remaining[target]!, remaining[index]!]
  }
  questions.value = [...completed, ...remaining]
}

function submitAnswer() {
  if (!selectedAnswer.value || submittedAnswer.value) return
  submittedAnswer.value = selectedAnswer.value
  if (isCorrect.value) correctCount.value += 1
  nextTick(() => document.querySelector<HTMLElement>('.answer-result')?.focus())
}

function nextQuestion() {
  if (!submittedAnswer.value) return
  if (currentIndex.value === questions.value.length - 1) {
    finished.value = true
    return
  }
  currentIndex.value += 1
  selectedAnswer.value = null
  submittedAnswer.value = null
  displayedOptions.value = shuffleOptions(currentQuestion.value)
  nextTick(() => document.querySelector<HTMLElement>('.dmv-question h1')?.focus())
}

function restart() {
  currentIndex.value = 0
  questions.value = [...questionBank.questions]
  displayedOptions.value = shuffleOptions(questions.value[0]!)
  selectedAnswer.value = null
  submittedAnswer.value = null
  correctCount.value = 0
  finished.value = false
}

function optionClass(key: string) {
  if (!submittedAnswer.value) return { selected: selectedAnswer.value === key }
  return {
    correct: key === currentQuestion.value.correct_answer,
    incorrect: key === submittedAnswer.value && key !== currentQuestion.value.correct_answer,
  }
}
</script>

<template>
  <div class="dmv-page">
    <header class="dmv-topbar">
      <RouterLink class="dmv-wordmark" to="/">
        <span class="dmv-mini-sign">CA</span>
        <span>California DMV practice</span>
      </RouterLink>
      <span class="dmv-bank-count">100 questions</span>
    </header>

    <main v-if="!finished" class="dmv-layout">
      <aside class="dmv-progress" aria-label="Quiz progress">
        <RouterLink class="back-link" to="/">← Interview Room</RouterLink>
        <div class="dmv-progress-number">
          <strong>{{ String(currentIndex + 1).padStart(2, '0') }}</strong>
          <span>/ {{ questions.length }}</span>
        </div>
        <div class="dmv-progress-track">
          <i :style="{ height: `${progress}%`, width: `${progress}%` }"></i>
        </div>
        <div class="dmv-score">
          <strong>{{ correctCount }}</strong>
          <span>correct so far</span>
        </div>
        <button
          class="dmv-shuffle"
          type="button"
          :disabled="currentIndex === questions.length - 1"
          @click="shuffleRemaining"
        >
          <span aria-hidden="true">⇄</span>
          Shuffle remaining
        </button>
        <p>Based on the California Driver’s Handbook (2025). Not official exam questions.</p>
      </aside>

      <section class="dmv-stage">
        <article class="dmv-question">
          <div class="dmv-question-meta">
            <span>{{ currentQuestion.category }}</span>
            <span>{{ currentQuestion.source_section }}</span>
          </div>
          <h1 tabindex="-1">{{ currentQuestion.question }}</h1>

          <form class="dmv-options" @submit.prevent="submitAnswer">
            <fieldset :disabled="Boolean(submittedAnswer)">
              <legend class="sr-only">Choose one answer</legend>
              <label
                v-for="option in displayedOptions"
                :key="option.key"
                :class="optionClass(option.key)"
              >
                <input v-model="selectedAnswer" type="radio" :value="option.key" />
                <span class="option-key">{{ option.key }}</span>
                <span>{{ option.text }}</span>
                <span
                  v-if="submittedAnswer && option.key === currentQuestion.correct_answer"
                  class="option-mark"
                  >✓</span
                >
                <span
                  v-else-if="submittedAnswer && option.key === submittedAnswer"
                  class="option-mark"
                  >×</span
                >
              </label>
            </fieldset>
            <button
              v-if="!submittedAnswer"
              class="button button--dmv-submit"
              type="submit"
              :disabled="!selectedAnswer"
            >
              Submit answer
            </button>
          </form>

          <section
            v-if="submittedAnswer"
            class="answer-result"
            :class="{ 'answer-result--correct': isCorrect }"
            tabindex="-1"
            aria-live="polite"
          >
            <p class="answer-verdict">{{ isCorrect ? 'Correct' : 'Not quite' }}</p>
            <h2 v-if="!isCorrect">The correct answer is {{ currentQuestion.correct_answer }}.</h2>
            <p>{{ currentQuestion.explanation }}</p>
            <span>{{ currentQuestion.source_section }} · California Driver’s Handbook</span>
            <button class="button button--dmv-next" type="button" @click="nextQuestion">
              {{ currentIndex === questions.length - 1 ? 'See results' : 'Next question' }}
            </button>
          </section>
        </article>
      </section>
    </main>

    <main v-else class="dmv-results">
      <span class="dmv-results-sign" aria-hidden="true">✓</span>
      <p class="context-line">Practice complete</p>
      <h1>{{ correctCount }} out of {{ questions.length }}</h1>
      <p>
        You answered {{ Math.round((correctCount / questions.length) * 100) }}% correctly. Review
        the handbook sections that slowed you down, then take another pass.
      </p>
      <div>
        <button class="button button--dmv-submit" type="button" @click="restart">
          Practice again
        </button>
        <RouterLink class="text-button" to="/">Back to Interview Room</RouterLink>
      </div>
    </main>
  </div>
</template>
