import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { orders } from '@/db/schema'
import { requireUser } from '@/lib/server-auth'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const db = getDb()
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))
    .limit(50)

  return NextResponse.json({ items: rows })
}
