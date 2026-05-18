import { compare, hash } from 'bcryptjs'
import { createHash, randomBytes } from 'node:crypto'
import { Router } from 'express'
import { z } from 'zod'
import {
  MIN_PASSWORD_LENGTH,
  NAME_MAX_LENGTH,
  type LoginResponse,
  type RegistrationResponse,
} from '../../../shared/auth.js'
import { pool } from '../db.js'

const registerRequestSchema = z.object({
  firstName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  lastName: z.string().trim().min(1).max(NAME_MAX_LENGTH),
  email: z.string().trim().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
  acceptedTerms: z.boolean().refine((value) => value, {
    message: 'You must accept the terms to register.',
  }),
  marketingOptIn: z.boolean().default(false),
})

const loginRequestSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(MIN_PASSWORD_LENGTH),
  rememberMe: z.boolean().default(false),
})

export const authRouter = Router()

type AuthRow = {
  id: string
  email: string
  first_name: string
  last_name: string
  password_hash: string
  status: 'pending_verification' | 'active' | 'disabled'
  created_at: Date
}

function toAuthUser(user: Omit<AuthRow, 'password_hash'>) {
  return {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    status: user.status,
    createdAt: user.created_at.toISOString(),
  }
}

authRouter.post('/register', async (req, res) => {
  const parsedRequest = registerRequestSchema.safeParse(req.body)

  if (!parsedRequest.success) {
    return res.status(400).json({
      message: 'Invalid registration payload.',
      errors: parsedRequest.error.flatten().fieldErrors,
    })
  }

  const { acceptedTerms, email, firstName, lastName, marketingOptIn, password } = parsedRequest.data

  try {
    const passwordHash = await hash(password, 12)
    const acceptedTermsAt = new Date()
    const result = await pool.query<Omit<AuthRow, 'password_hash'>>(
      `
        INSERT INTO users (
          email,
          password_hash,
          first_name,
          last_name,
          accepted_terms_at,
          marketing_opt_in
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, email::text, first_name, last_name, status, created_at
      `,
      [email, passwordHash, firstName, lastName, acceptedTerms ? acceptedTermsAt : null, marketingOptIn],
    )

    const createdUser = result.rows[0]

    if (!createdUser) {
      throw new Error('Registration insert returned no rows.')
    }

    const responseBody: RegistrationResponse = {
      message: 'Account created. Check your inbox to verify your email address.',
      user: toAuthUser(createdUser),
    }

    return res.status(201).json(responseBody)
  } catch (error) {
    const databaseErrorCode =
      typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : undefined

    if (databaseErrorCode === '23505') {
      return res.status(409).json({
        message: 'An account with that email already exists.',
      })
    }

    console.error('Registration failed', error)
    return res.status(500).json({
      message: 'Registration failed due to a server error.',
    })
  }
})

authRouter.post('/login', async (req, res) => {
  const parsedRequest = loginRequestSchema.safeParse(req.body)

  if (!parsedRequest.success) {
    return res.status(400).json({
      message: 'Invalid login payload.',
      errors: parsedRequest.error.flatten().fieldErrors,
    })
  }

  const { email, password, rememberMe } = parsedRequest.data

  try {
    const result = await pool.query<AuthRow>(
      `
        SELECT id, email::text, first_name, last_name, password_hash, status, created_at
        FROM users
        WHERE email = $1
      `,
      [email],
    )

    const existingUser = result.rows[0]

    if (!existingUser) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    if (existingUser.status === 'disabled') {
      return res.status(403).json({
        message: 'This account has been disabled.',
      })
    }

    const passwordMatches = await compare(password, existingUser.password_hash)

    if (!passwordMatches) {
      return res.status(401).json({
        message: 'Invalid email or password.',
      })
    }

    const sessionToken = randomBytes(32).toString('hex')
    const sessionTokenHash = createHash('sha256').update(sessionToken).digest('hex')
    const expiresAt = new Date(
      Date.now() + (rememberMe ? 1000 * 60 * 60 * 24 * 30 : 1000 * 60 * 60 * 24),
    )

    await pool.query('BEGIN')
    await pool.query(
      `
        INSERT INTO sessions (user_id, session_token_hash, expires_at)
        VALUES ($1, $2, $3)
      `,
      [existingUser.id, sessionTokenHash, expiresAt],
    )
    await pool.query(
      `
        UPDATE users
        SET last_login_at = now()
        WHERE id = $1
      `,
      [existingUser.id],
    )
    await pool.query('COMMIT')

    const responseBody: LoginResponse = {
      message:
        existingUser.status === 'pending_verification'
          ? 'Signed in. Your email is still pending verification.'
          : 'Signed in successfully.',
      user: toAuthUser(existingUser),
      session: {
        expiresAt: expiresAt.toISOString(),
        token: sessionToken,
      },
    }

    return res.status(200).json(responseBody)
  } catch (error) {
    await pool.query('ROLLBACK').catch(() => undefined)
    console.error('Login failed', error)
    return res.status(500).json({
      message: 'Login failed due to a server error.',
    })
  }
})
