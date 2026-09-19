import { createHmac, timingSafeEqual } from 'node:crypto'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const COOKIE_NAME = 'interview_session'
const SESSION_AGE_SECONDS = 60 * 60 * 24 * 7

function secret() {
  const value = process.env.SESSION_SECRET
  if (!value || value.length < 24) throw new Error('SESSION_SECRET must be at least 24 characters')
  return value
}

function signature(payload: string) {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

export function createSessionToken() {
  const payload = Buffer.from(
    JSON.stringify({ expiresAt: Date.now() + SESSION_AGE_SECONDS * 1000 }),
  ).toString('base64url')
  return `${payload}.${signature(payload)}`
}

export function isAuthorized(request: VercelRequest) {
  try {
    const cookieHeader = request.headers.cookie ?? ''
    const cookies = Object.fromEntries(
      cookieHeader
        .split(';')
        .map((entry) => entry.trim().split('='))
        .filter((pair) => pair.length === 2),
    )
    const token = cookies[COOKIE_NAME]
    if (!token) return false

    const [payload, suppliedSignature] = token.split('.')
    if (!payload || !suppliedSignature || !safeEqual(signature(payload), suppliedSignature)) {
      return false
    }

    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString()) as {
      expiresAt?: number
    }
    return typeof decoded.expiresAt === 'number' && decoded.expiresAt > Date.now()
  } catch {
    return false
  }
}

export function setSessionCookie(response: VercelResponse, token: string) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=${SESSION_AGE_SECONDS}${secure}`,
  )
}

export function clearSessionCookie(response: VercelResponse) {
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  response.setHeader(
    'Set-Cookie',
    `${COOKIE_NAME}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`,
  )
}
