import { NextResponse } from 'next/server'
import { z } from 'zod'

import { type DB, getDb } from '@/db'
import { cart, cartItems, products } from '@/db/schema'
import { requireUser } from '@/lib/server-auth'
import { eq, sql } from 'drizzle-orm'

const addSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
})

async function getOrCreateCartId(db: DB, userId: string) {
  const existing = await db
    .select({ id: cart.id })
    .from(cart)
    .where(eq(cart.userId, userId))
    .limit(1)
  if (existing[0]?.id) return existing[0].id

  const created = await db
    .insert(cart)
    .values({ userId })
    .returning({ id: cart.id })
  return created[0].id
}

export async function GET() {
  const db = getDb()
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const cartId = await getOrCreateCartId(db, session.user.id)

  const items = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      product: products,
    })
    .from(cartItems)
    .innerJoin(products, eq(products.id, cartItems.productId))
    .where(eq(cartItems.cartId, cartId))

  return NextResponse.json({ cartId, items })
}

export async function POST(req: Request) {
  const db = getDb()
  const session = await requireUser()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const json = await req.json().catch(() => null)
  const parsed = addSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const { productId, quantity } = parsed.data
  const cartId = await getOrCreateCartId(db, session.user.id)

  const productRow = await db
    .select({ id: products.id, stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)
  const product = productRow[0]
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  if (product.stock <= 0) return NextResponse.json({ error: 'Out of stock' }, { status: 409 })

  await db
    .insert(cartItems)
    .values({ cartId, productId, quantity })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productId],
      set: {
        quantity: sql`${cartItems.quantity} + ${quantity}`,
      },
    })

  await db.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, cartId))

  return NextResponse.json({ ok: true })
}
