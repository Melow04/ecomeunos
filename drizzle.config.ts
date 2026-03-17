import { config as dotenvConfig } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

dotenvConfig()

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? '',
  },
  strict: true,
  verbose: false,
})
