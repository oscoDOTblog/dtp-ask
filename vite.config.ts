import { fileURLToPath, URL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'

import { defineConfig, loadEnv, type Plugin } from 'vite'
import type { VercelRequest, VercelResponse } from '@vercel/node'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import evaluateHandler from './api/evaluate.js'
import sessionHandler from './api/session.js'

function roomPasswordOutput(password: string | undefined): Plugin {
  return {
    name: 'room-password-output',
    apply: 'serve',
    configureServer(server) {
      server.httpServer?.once('listening', () => {
        const value = password || 'practice-room'
        server.config.logger.info(`\n  ➜  Room password: ${value}\n`)
      })
    },
  }
}

const developmentEnv = loadEnv('development', process.cwd(), '')
for (const [key, value] of Object.entries(developmentEnv)) process.env[key] ??= value

async function parseJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []
  let size = 0
  for await (const chunk of request) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > 64 * 1024) throw new Error('JSON request is too large')
    chunks.push(buffer)
  }
  return chunks.length ? (JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown) : {}
}

function adaptResponse(response: ServerResponse) {
  const adapted = response as VercelResponse
  adapted.status = (statusCode: number) => {
    response.statusCode = statusCode
    return adapted
  }
  adapted.json = (body: unknown) => {
    if (!response.hasHeader('Content-Type')) {
      response.setHeader('Content-Type', 'application/json; charset=utf-8')
    }
    response.end(JSON.stringify(body))
    return adapted
  }
  adapted.send = (body: unknown) => {
    response.end(typeof body === 'string' || Buffer.isBuffer(body) ? body : JSON.stringify(body))
    return adapted
  }
  return adapted
}

function localApi(): Plugin {
  return {
    name: 'local-vercel-api',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url?.split('?')[0]
        const handler =
          pathname === '/api/session'
            ? sessionHandler
            : pathname === '/api/evaluate'
              ? evaluateHandler
              : undefined
        if (!handler) return next()

        try {
          const vercelRequest = request as VercelRequest
          if (request.headers['content-type']?.includes('application/json')) {
            vercelRequest.body = await parseJsonBody(request)
          }
          await handler(vercelRequest, adaptResponse(response))
        } catch (error) {
          server.config.logger.error(
            error instanceof Error ? error.stack || error.message : String(error),
          )
          if (!response.headersSent) {
            response.statusCode = 500
            response.setHeader('Content-Type', 'application/json; charset=utf-8')
          }
          if (!response.writableEnded) {
            response.end(JSON.stringify({ error: 'Local API request failed.' }))
          }
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(),
    localApi(),
    roomPasswordOutput(developmentEnv.APP_PASSWORD),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
