import 'dotenv/config'
import { app } from './app.js'
import { checkDatabaseConnection, pool } from './db.js'
import { serverEnv } from './config.js'

let server: ReturnType<typeof app.listen> | undefined

async function shutdown(signal: string) {
  console.log(`Received ${signal}. Shutting down API.`)

  if (!server) {
    await pool.end()
    process.exit(0)
  }

  server.close(async () => {
    await pool.end()
    process.exit(0)
  })
}

async function startServer() {
  const connection = await checkDatabaseConnection()

  console.log(
    `Connected to PostgreSQL database ${connection?.current_database} as ${connection?.current_user}.`,
  )

  server = app.listen(serverEnv.PORT, () => {
    console.log(`API listening on http://localhost:${serverEnv.PORT}`)
  })
}

void startServer().catch(async (error: unknown) => {
  console.error('Unable to connect to PostgreSQL during startup.', error)
  await pool.end()
  process.exit(1)
})

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})
