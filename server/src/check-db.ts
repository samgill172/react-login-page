import 'dotenv/config'
import { checkDatabaseConnection, pool } from './db.js'

async function main() {
  const connection = await checkDatabaseConnection()

  console.log(
    `Connected to PostgreSQL database ${connection?.current_database} as ${connection?.current_user} at ${connection?.connected_at.toISOString()}.`,
  )

  await pool.end()
}

void main().catch(async (error: unknown) => {
  console.error('Database connectivity check failed.', error)
  await pool.end()
  process.exit(1)
})
