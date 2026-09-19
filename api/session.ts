import type { VercelRequest, VercelResponse } from '@vercel/node'
import {
  clearSessionCookie,
  createSessionToken,
  isAuthorized,
  safeEqual,
  setSessionCookie,
} from './_lib/auth.js'

export default function handler(request: VercelRequest, response: VercelResponse) {
  response.setHeader('Cache-Control', 'no-store')

  if (request.method === 'GET') {
    return response.status(200).json({
      authenticated: isAuthorized(request),
      aiAvailable: Boolean(process.env.OPENAI_API_KEY),
    })
  }

  if (request.method === 'DELETE') {
    clearSessionCookie(response)
    return response.status(204).end()
  }

  if (request.method !== 'POST') {
    response.setHeader('Allow', 'GET, POST, DELETE')
    return response.status(405).json({ error: 'Method not allowed.' })
  }

  const expected =
    process.env.APP_PASSWORD ||
    (process.env.NODE_ENV !== 'production' ? 'practice-room' : undefined)
  if (!expected) return response.status(503).json({ error: 'App password is not configured.' })

  const password = typeof request.body?.password === 'string' ? request.body.password : ''
  if (!safeEqual(password, expected)) {
    return response.status(401).json({ error: 'That password did not match.' })
  }

  try {
    setSessionCookie(response, createSessionToken())
    return response.status(200).json({
      authenticated: true,
      aiAvailable: Boolean(process.env.OPENAI_API_KEY),
    })
  } catch {
    return response.status(503).json({ error: 'Session security is not configured.' })
  }
}
