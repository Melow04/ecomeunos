import { Pool } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-serverless'

import * as schema from './schema'

export type DB = ReturnType<typeof drizzle>

let cachedDb: DB | null = null

export function getDb() {
  if (cachedDb) return cachedDb

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set')
  }

  const pool = new Pool({ connectionString })
  cachedDb = drizzle(pool, { schema })
  return cachedDb
}
