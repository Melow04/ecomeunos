import { config as dotenvConfig } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenvConfig({ path: '.env.local' })
dotenvConfig()

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: false,
  verbose: false,
})
