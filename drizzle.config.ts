import dotenv from 'dotenv'
import { defineConfig } from 'drizzle-kit'
import path from 'node:path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
dotenv.config({ path: path.resolve(process.cwd(), '.env') })

if (process.env.SKIP_ENV_VALIDATION !== 'true') {
  if (!process.env.DATABASE_URL)
    throw new Error('Missing environment variable DATABASE_URL')
}

export default defineConfig({
  schema: './src/server/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
