import bcrypt from 'bcryptjs'
import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDb } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(320),
  password: z.string().min(6).max(200),
})

export async function POST(req: Request) {
  const db = getDb()
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { firstName, lastName, email, password } = parsed.data

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existing.length > 0) {
    return NextResponse.json({ error: 'Email already in use' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const name = `${firstName} ${lastName}`.trim()

  const inserted = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      role: 'user',
    })
    .returning({ id: users.id, email: users.email, name: users.name })

  return NextResponse.json({ user: inserted[0] }, { status: 201 })
}
