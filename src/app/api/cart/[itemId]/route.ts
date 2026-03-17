import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDb } from '@/db'
import { cart, cartItems } from '@/db/schema'
import { requireUser } from '@/lib/server-auth'
import { and, eq } from 'drizzle-orm'

const patchSchema = z.object({
  quantity: z.number().int().min(0).max(99),
})

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const db = getDb()
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId } = await params

  const json = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const cartRow = await db
    .select({ id: cart.id })
    .from(cart)
    .where(eq(cart.userId, session.user.id))
    .limit(1)
  const cartId = cartRow[0]?.id
  if (!cartId) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  if (parsed.data.quantity === 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    return NextResponse.json({ ok: true })
  }

  const updated = await db
    .update(cartItems)
    .set({ quantity: parsed.data.quantity })
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .returning({ id: cartItems.id })

  if (updated.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, cartId))
  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ itemId: string }> }
) {
  const db = getDb()
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { itemId } = await params

  const cartRow = await db
    .select({ id: cart.id })
    .from(cart)
    .where(eq(cart.userId, session.user.id))
    .limit(1)
  const cartId = cartRow[0]?.id
  if (!cartId) return NextResponse.json({ error: 'Cart not found' }, { status: 404 })

  const deleted = await db
    .delete(cartItems)
    .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
    .returning({ id: cartItems.id })

  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, cartId))
  return NextResponse.json({ ok: true })
}
