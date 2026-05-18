import { Pool, type PoolConfig } from 'pg'
import { serverEnv } from './config.js'

type ParsedConnInfo = {
  host?: string
  port?: number
  database?: string
  user?: string
  password?: string
  ssl?: PoolConfig['ssl']
  sslMode?: 'disable' | 'allow' | 'prefer' | 'require' | 'verify-ca' | 'verify-full'
  connectionTimeoutMillis?: number
}

function parseLibpqConnectionString(connectionString: string): ParsedConnInfo | undefined {
  const trimmedConnectionString = connectionString.trim()

  if (
    trimmedConnectionString === '' ||
    trimmedConnectionString.startsWith('postgres://') ||
    trimmedConnectionString.startsWith('postgresql://')
  ) {
    return undefined
  }

  const entries = Array.from(
    trimmedConnectionString.matchAll(/([a-zA-Z_][a-zA-Z0-9_]*)=([^\s]+)/g),
  )

  if (entries.length === 0) {
    return undefined
  }

  const values = Object.fromEntries(
    entries.map((match) => [match[1]?.toLowerCase() ?? '', match[2] ?? '']),
  )
  const sslMode = values.sslmode?.toLowerCase()

  let ssl: PoolConfig['ssl']

  if (sslMode === 'disable') {
    ssl = undefined
  } else if (sslMode === 'verify-full' || sslMode === 'verify-ca') {
    ssl = { rejectUnauthorized: true }
  } else if (sslMode === 'prefer' || sslMode === 'require' || sslMode === 'allow') {
    ssl = { rejectUnauthorized: false }
  }

  const parsedConnInfo: ParsedConnInfo = {}

  if (values.host) {
    parsedConnInfo.host = values.host
  }

  if (values.port) {
    parsedConnInfo.port = Number(values.port)
  }

  const databaseName = values.dbname ?? values.database

  if (databaseName) {
    parsedConnInfo.database = databaseName
  }

  if (values.user) {
    parsedConnInfo.user = values.user
  }

  if (values.password) {
    parsedConnInfo.password = values.password
  }

  if (ssl !== undefined) {
    parsedConnInfo.ssl = ssl
  }

  if (
    sslMode === 'disable' ||
    sslMode === 'allow' ||
    sslMode === 'prefer' ||
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full'
  ) {
    parsedConnInfo.sslMode = sslMode
  }

  if (values.connect_timeout) {
    parsedConnInfo.connectionTimeoutMillis = Number(values.connect_timeout) * 1000
  }

  return parsedConnInfo
}

const basePoolConfig: PoolConfig = {
  max: serverEnv.DATABASE_MAX_CONNECTIONS,
  idleTimeoutMillis: serverEnv.DATABASE_IDLE_TIMEOUT_MS,
  connectionTimeoutMillis: serverEnv.DATABASE_CONNECTION_TIMEOUT_MS,
  ssl: serverEnv.DATABASE_SSL
    ? {
        rejectUnauthorized: serverEnv.DATABASE_SSL_REJECT_UNAUTHORIZED,
      }
    : undefined,
}

const hasDiscreteDatabaseConfig = Boolean(
  serverEnv.DATABASE_HOST &&
    serverEnv.DATABASE_NAME &&
    serverEnv.DATABASE_USER &&
    serverEnv.DATABASE_PASSWORD,
)

const parsedConnInfo = serverEnv.DATABASE_URL
  ? parseLibpqConnectionString(serverEnv.DATABASE_URL)
  : undefined

const shouldRetryWithoutSsl =
  parsedConnInfo?.sslMode === 'prefer' || parsedConnInfo?.sslMode === 'allow'

function createPoolConfig(forceDisableSsl = false): PoolConfig {
  return hasDiscreteDatabaseConfig
  ? {
      ...basePoolConfig,
      host: serverEnv.DATABASE_HOST,
      port: serverEnv.DATABASE_PORT,
      database: serverEnv.DATABASE_NAME,
      user: serverEnv.DATABASE_USER,
      password: serverEnv.DATABASE_PASSWORD,
    }
  : parsedConnInfo
    ? {
        ...basePoolConfig,
        ...parsedConnInfo,
        ssl: forceDisableSsl ? undefined : parsedConnInfo.ssl,
        connectionTimeoutMillis:
          parsedConnInfo.connectionTimeoutMillis ?? basePoolConfig.connectionTimeoutMillis,
      }
  : {
      ...basePoolConfig,
      connectionString: serverEnv.DATABASE_URL,
    }
}

export let pool = new Pool(createPoolConfig())

function isSslUnsupportedError(error: unknown) {
  return (
    error instanceof Error &&
    /does not support ssl|does not support ssl connections/i.test(error.message)
  )
}

async function reconnectWithoutSsl() {
  await pool.end().catch(() => undefined)
  pool = new Pool(createPoolConfig(true))
}

export async function checkDatabaseConnection() {
  try {
    const client = await pool.connect()

    try {
      const result = await client.query<{
        current_database: string
        current_user: string
        connected_at: Date
      }>(
        `
          SELECT current_database() AS current_database,
                 current_user AS current_user,
                 now() AS connected_at
        `,
      )

      return result.rows[0]
    } finally {
      client.release()
    }
  } catch (error) {
    if (shouldRetryWithoutSsl && isSslUnsupportedError(error)) {
      await reconnectWithoutSsl()

      const client = await pool.connect()

      try {
        const result = await client.query<{
          current_database: string
          current_user: string
          connected_at: Date
        }>(
          `
            SELECT current_database() AS current_database,
                   current_user AS current_user,
                   now() AS connected_at
          `,
        )

        return result.rows[0]
      } finally {
        client.release()
      }
    }

    throw error
  }
}
