import 'dotenv/config'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkDatabaseConnection, pool } from './db.js'

const dirname = path.dirname(fileURLToPath(import.meta.url))
const schemaPath = path.resolve(dirname, '../../database/001_users.sql')

async function main() {
  const connection = await checkDatabaseConnection()
  const schemaSql = await readFile(schemaPath, 'utf8')

  await pool.query(schemaSql)

  console.log(
    `Applied database schema to ${connection?.current_database} as ${connection?.current_user}.`,
  )

  await pool.end()
}

void main().catch(async (error: unknown) => {
  console.error('Database migration failed.', error)
  await pool.end()
  process.exit(1)
})