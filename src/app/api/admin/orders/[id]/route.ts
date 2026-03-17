import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDb } from '@/db'
import { orders } from '@/db/schema'
import { requireAdmin } from '@/lib/server-auth'
import { eq } from 'drizzle-orm'

const bodySchema = z.object({
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const updated = await db
    .update(orders)
    .set({ status: parsed.data.status })
    .where(eq(orders.id, id))
    .returning({ id: orders.id })

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ ok: true })
}
