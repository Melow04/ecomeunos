import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { users } from '@/db/schema'
import { requireAdmin } from '@/lib/server-auth'
import { eq } from 'drizzle-orm'

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params

  const deleted = await db.delete(users).where(eq(users.id, id)).returning({ id: users.id })
  
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
