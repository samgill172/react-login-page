import { z } from 'zod'

const booleanFromEnv = (defaultValue: boolean) =>
  z
    .enum(['true', 'false'])
    .default(defaultValue ? 'true' : 'false')
    .transform((value) => value === 'true')

const optionalString = z.preprocess(
  (value) => {
    if (typeof value !== 'string') {
      return value
    }

    const trimmedValue = value.trim()
    return trimmedValue === '' ? undefined : trimmedValue
  },
  z.string().trim().min(1).optional(),
)

const envSchema = z
  .object({
    DATABASE_URL: optionalString,
    DATABASE_HOST: optionalString,
    DATABASE_PORT: z.coerce.number().int().positive().max(65535).default(5432),
    DATABASE_NAME: optionalString,
    DATABASE_USER: optionalString,
    DATABASE_PASSWORD: optionalString,
    DATABASE_SSL: booleanFromEnv(true),
    DATABASE_SSL_REJECT_UNAUTHORIZED: booleanFromEnv(true),
    DATABASE_MAX_CONNECTIONS: z.coerce.number().int().positive().max(50).default(10),
    DATABASE_IDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
    DATABASE_CONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    PORT: z.coerce.number().int().positive().default(4000),
    FRONTEND_ORIGIN: z.string().url().default('http://localhost:5173'),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  })
  .superRefine((env, context) => {
    const hasUrl = Boolean(env.DATABASE_URL)
    const hasDiscreteConfig = Boolean(
      env.DATABASE_HOST && env.DATABASE_NAME && env.DATABASE_USER && env.DATABASE_PASSWORD,
    )

    if (!hasUrl && !hasDiscreteConfig) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Set DATABASE_URL as either a postgres URL or a libpq key=value string, or set all of DATABASE_HOST, DATABASE_NAME, DATABASE_USER, and DATABASE_PASSWORD.',
        path: ['DATABASE_URL'],
      })
    }
  })

export const serverEnv = envSchema.parse(process.env)
