import cors from 'cors'
import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'
import { authRouter } from './routes/auth.js'
import { pool } from './db.js'
import { serverEnv } from './config.js'


const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const app = express()

app.use(
  cors({
    origin: serverEnv.FRONTEND_ORIGIN,
  }),
)
app.use(express.json())

// Serve static files from the frontend build
app.use(express.static(path.join(__dirname, '../../../dist')))

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    next(error)
  }
})

app.use('/api/auth', authRouter)

// Serve index.html for all non-API routes (SPA fallback)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '../../../dist/index.html'))
  } else {
    next()
  }
})

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next
  console.error('Unhandled server error', error)
  res.status(500).json({
    message: 'Internal server error.',
  })
})
