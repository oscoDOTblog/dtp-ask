import OpenAI from 'openai'
import { zodTextFormat } from 'openai/helpers/zod'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { isAuthorized } from './_lib/auth.js'
import {
  answerEvaluationSchema,
  evaluationInput,
  evaluationInstructions,
  technicalEvaluationInstructions,
} from './_lib/evaluation.js'

const MAX_AUDIO_BYTES = 4 * 1024 * 1024
const MAX_DURATION_SECONDS = 120
const MAX_TRANSCRIPT_LENGTH = 12_000
const allowedAudioTypes = new Set([
  'audio/webm',
  'audio/ogg',
  'audio/mp4',
  'audio/mpeg',
  'audio/wav',
  'audio/x-m4a',
])

const rateLimits = new Map<string, number[]>()

function allowRequest(request: VercelRequest) {
  const forwarded = request.headers['x-forwarded-for']
  const address = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0] ?? 'local'
  const now = Date.now()
  const windowStart = now - 10 * 60 * 1000
  const recent = (rateLimits.get(address) ?? []).filter((time) => time > windowStart)
  if (recent.length >= 10) return false
  recent.push(now)
  rateLimits.set(address, recent)
  return true
}

async function rawRequestBody(request: VercelRequest) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > MAX_AUDIO_BYTES + 64 * 1024) throw new Error('PAYLOAD_TOO_LARGE')
    chunks.push(buffer)
  }
  return Buffer.concat(chunks)
}

async function parseInput(request: VercelRequest, openai: OpenAI) {
  const contentType = request.headers['content-type'] ?? ''
  if (contentType.includes('application/json')) {
    const body = request.body ?? {}
    return {
      transcript: typeof body.transcript === 'string' ? body.transcript.trim() : '',
      question: typeof body.question === 'string' ? body.question : '',
      category: typeof body.category === 'string' ? body.category : '',
      expectedBeats: Array.isArray(body.expectedBeats) ? body.expectedBeats : [],
      followUp: typeof body.followUp === 'string' ? body.followUp : '',
      durationSeconds: Number(body.durationSeconds),
    }
  }

  if (!contentType.includes('multipart/form-data')) throw new Error('UNSUPPORTED_MEDIA')
  const buffer = await rawRequestBody(request)
  const webRequest = new Request('https://local.invalid/api/evaluate', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body: buffer,
  })
  const form = await webRequest.formData()
  const audio = form.get('audio')
  if (!(audio instanceof File) || audio.size === 0) throw new Error('AUDIO_REQUIRED')
  if (audio.size > MAX_AUDIO_BYTES) throw new Error('PAYLOAD_TOO_LARGE')
  if (!allowedAudioTypes.has(audio.type.split(';')[0] ?? '')) throw new Error('UNSUPPORTED_MEDIA')

  const durationSeconds = Number(form.get('durationSeconds'))
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: 'gpt-transcribe',
    prompt:
      'Interview preparation discussing Apple, Wallet, Payments and Commerce, Capital One, Sway, Vue, React, Next.js, SwiftUI, AVFoundation, StoreKit, APIs, idempotency, and distributed systems.',
  })

  return {
    transcript: transcription.text.trim(),
    question: String(form.get('question') ?? ''),
    category: String(form.get('category') ?? ''),
    expectedBeats: JSON.parse(String(form.get('expectedBeats') ?? '[]')) as unknown,
    followUp: String(form.get('followUp') ?? ''),
    durationSeconds,
  }
}

function validateInput(input: Awaited<ReturnType<typeof parseInput>>) {
  if (!input.transcript || input.transcript.length > MAX_TRANSCRIPT_LENGTH) {
    throw new Error('INVALID_TRANSCRIPT')
  }
  if (!input.question || input.question.length > 500) throw new Error('INVALID_QUESTION')
  if (
    input.category &&
    ![
      'story',
      'product',
      'collaboration',
      'reliability',
      'architecture',
      'team-fit',
      'technical-fundamentals',
    ].includes(input.category)
  )
    throw new Error('INVALID_CATEGORY')
  if (
    !Array.isArray(input.expectedBeats) ||
    input.expectedBeats.some((beat) => typeof beat !== 'string') ||
    input.expectedBeats.length > 10
  ) {
    throw new Error('INVALID_BEATS')
  }
  if (
    !Number.isFinite(input.durationSeconds) ||
    input.durationSeconds <= 0 ||
    input.durationSeconds > MAX_DURATION_SECONDS + 2
  ) {
    throw new Error('INVALID_DURATION')
  }
}

function errorMessage(error: unknown) {
  const code = error instanceof Error ? error.message : ''
  if (code === 'PAYLOAD_TOO_LARGE')
    return ['Recording is too large. Keep it under two minutes.', 413]
  if (code === 'UNSUPPORTED_MEDIA') return ['This recording format is not supported.', 415]
  if (code === 'AUDIO_REQUIRED') return ['Record an answer before requesting feedback.', 400]
  if (code.startsWith('INVALID_')) return ['The answer submission is incomplete or invalid.', 400]
  return ['Feedback could not be generated. Try again in a moment.', 502]
}

export default async function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store')
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST')
    return response.status(405).json({ error: 'Method not allowed.' })
  }
  if (!isAuthorized(request)) return response.status(401).json({ error: 'Session expired.' })
  if (!allowRequest(request)) {
    response.setHeader('Retry-After', '600')
    return response.status(429).json({ error: 'Practice limit reached. Try again in ten minutes.' })
  }
  if (!process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: 'OpenAI is not configured.' })
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    const input = await parseInput(request, openai)
    validateInput(input)

    const grading = await openai.responses.parse({
      model: 'gpt-5-mini',
      store: false,
      max_output_tokens: 1600,
      instructions:
        input.category === 'technical-fundamentals'
          ? technicalEvaluationInstructions
          : evaluationInstructions,
      input: evaluationInput(
        {
          ...input,
          expectedBeats: input.expectedBeats as string[],
        },
        input.category === 'technical-fundamentals',
      ),
      text: { format: zodTextFormat(answerEvaluationSchema, 'answer_evaluation') },
    })

    if (!grading.output_parsed) throw new Error('INVALID_MODEL_OUTPUT')
    return response.status(200).json({
      transcript: input.transcript,
      evaluation: answerEvaluationSchema.parse(grading.output_parsed),
    })
  } catch (error) {
    const [message, status] = errorMessage(error)
    return response.status(Number(status)).json({ error: message })
  }
}
