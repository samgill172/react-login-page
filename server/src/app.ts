import cors from 'cors'
import express from 'express'
import { authRouter } from './routes/auth.js'
import { pool } from './db.js'
import { serverEnv } from './config.js'

export const app = express()

app.use(
  cors({
    origin: serverEnv.FRONTEND_ORIGIN,
  }),
)
app.use(express.json())

app.get('/api/health', async (_req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ status: 'ok' })
  } catch (error) {
    next(error)
  }
})

app.use('/api/auth', authRouter)

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  void _next
  console.error('Unhandled server error', error)
  res.status(500).json({
    message: 'Internal server error.',
  })
})
