import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/**
 * Dev-only plugin that intercepts /api/chat requests and runs
 * the Vercel serverless function handler so the AI chat works
 * with plain `npm run dev` (no need for `vercel dev`).
 */
function apiChatDevMiddleware() {
  let envLoaded = false

  return {
    name: 'api-chat-dev-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url !== '/api/chat' || req.method !== 'POST') {
          return next()
        }

        // Load .env.local into process.env once (Vite SSR doesn't do this automatically)
        if (!envLoaded) {
          try {
            const fs = await import('fs')
            const envPath = path.resolve(__dirname, '.env.local')
            if (fs.existsSync(envPath)) {
              const raw = fs.readFileSync(envPath, 'utf8')
              raw.split('\n').forEach((line) => {
                const trimmed = line.trim()
                if (!trimmed || trimmed.startsWith('#')) return
                const sep = trimmed.indexOf('=')
                if (sep === -1) return
                const key = trimmed.slice(0, sep).trim()
                const value = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '')
                if (key && !process.env[key]) {
                  process.env[key] = value
                }
              })
            }
          } catch { /* ignore */ }
          envLoaded = true
        }

        try {
          // Dynamically import the handler – Vite transpiles the TS on the fly
          const handlerModule = await server.ssrLoadModule(
            path.resolve(__dirname, 'api/chat.ts')
          )
          const handler = handlerModule.default

          // Collect the raw request body
          const chunks: Buffer[] = []
          for await (const chunk of req) {
            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
          }
          const body = JSON.parse(Buffer.concat(chunks).toString())

          // Build a minimal request/response adapter matching the VercelRequest/VercelResponse interface
          const fakeReq = { method: 'POST', body }
          const fakeRes = {
            _status: 200,
            status(code: number) {
              this._status = code
              return this
            },
            json(data: unknown) {
              res.writeHead(this._status, { 'Content-Type': 'application/json' })
              res.end(JSON.stringify(data))
            },
            setHeader(name: string, value: string) {
              res.setHeader(name, value)
            },
          }

          await handler(fakeReq, fakeRes)
        } catch (err) {
          console.error('[api-chat-dev] Error:', err)
          if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'Internal dev-server error in /api/chat.' }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    apiChatDevMiddleware(),
    // The React and Tailwind plugins are both required for Make, even if
    // Tailwind is not being actively used – do not remove them
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      // Alias @ to the src directory
      '@': path.resolve(__dirname, './src'),
    },
  },

  // File types to support raw imports. Never add .css, .tsx, or .ts files to this.
  assetsInclude: ['**/*.svg', '**/*.csv'],
})
