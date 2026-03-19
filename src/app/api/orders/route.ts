import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDb } from '@/db'
import {
  cart,
  cartItems,
  orderItems,
  orders,
  products,
  shippingAddresses,
} from '@/db/schema'
import { auth } from '@/lib/auth'
import { eq, inArray, and } from 'drizzle-orm'

const shippingSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email().max(320),
  phone: z.string().min(1).max(40),
  street: z.string().min(1).max(240),
  city: z.string().min(1).max(120),
  state: z.string().min(1).max(120),
  zip: z.string().min(1).max(20),
})

const bodySchema = z.object({
  step1: shippingSchema,
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  paymentMethod: z.enum(['card', 'ewallet', 'cod']),
  card: z
    .object({
      number: z.string().min(1),
      holder: z.string().min(1),
      expiry: z.string().min(1),
      cvv: z.string().min(1),
    })
    .optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .optional(),
})

function money(n: number) {
  return n.toFixed(2)
}

function shippingCost(method: 'standard' | 'express' | 'overnight') {
  if (method === 'standard') return 9.99
  if (method === 'express') return 19.99
  return 39.99
}

function statusFromStock(stock: number): 'active' | 'low-stock' | 'out-of-stock' {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  return 'active'
}

export async function POST(req: Request) {
  const db = getDb()
  const json = await req.json().catch(() => null)
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const session = await auth()
  const userId = session?.user?.id ?? null
  const shipping = parsed.data.step1
  const shipMethod = parsed.data.shippingMethod

  if (parsed.data.paymentMethod === 'card' && !parsed.data.card) {
    return NextResponse.json({ error: 'Card fields required' }, { status: 400 })
  }

  const itemsInput = parsed.data.items

  const items = await (async () => {
    if (!userId) {
      if (!itemsInput || itemsInput.length === 0) return null
      return itemsInput
    }

    const cartRow = await db
      .select({ id: cart.id })
      .from(cart)
      .where(eq(cart.userId, userId))
      .limit(1)
    const cartId = cartRow[0]?.id
    if (!cartId) return []

    const query = itemsInput && itemsInput.length > 0
      ? db
          .select({
            productId: cartItems.productId,
            quantity: cartItems.quantity,
          })
          .from(cartItems)
          .where(
            and(
              eq(cartItems.cartId, cartId),
              inArray(cartItems.productId, itemsInput.map(i => i.productId))
            )
          )
      : db
          .select({
            productId: cartItems.productId,
            quantity: cartItems.quantity,
          })
          .from(cartItems)
          .where(eq(cartItems.cartId, cartId))

    const cartRows = await query

    return cartRows
  })()

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
  }

  const productIds = Array.from(new Set(items.map((i) => i.productId)))

  const result = await db.transaction(async (tx) => {
    const productRows = await tx
      .select({
        id: products.id,
        name: products.name,
        price: products.price,
        stock: products.stock,
      })
      .from(products)
      .where(inArray(products.id, productIds))

    const productMap = new Map(productRows.map((p) => [p.id, p]))

    let subtotal = 0
    const lines = items.map((i) => {
      const p = productMap.get(i.productId)
      if (!p) throw new Error('missing_product')
      const unit = Number(p.price)
      const qty = i.quantity
      if (qty <= 0) throw new Error('invalid_qty')
      if (p.stock < qty) throw new Error('insufficient_stock')
      subtotal += unit * qty
      return { product: p, quantity: qty, unitPrice: unit }
    })

    for (const line of lines) {
      const newStock = line.product.stock - line.quantity
      await tx
        .update(products)
        .set({
          stock: newStock,
          status: statusFromStock(newStock),
        })
        .where(eq(products.id, line.product.id))
    }

    const shippingC = shippingCost(shipMethod)
    const tax = subtotal * 0.08
    const total = subtotal + shippingC + tax

    const orderRow = await tx
      .insert(orders)
      .values({
        userId,
        status: 'pending',
        subtotal: money(subtotal),
        shippingCost: money(shippingC),
        tax: money(tax),
        total: money(total),
        shippingMethod: shipMethod,
        guestEmail: userId ? null : shipping.email,
      })
      .returning({ id: orders.id })

    const orderId = orderRow[0].id

    await tx.insert(shippingAddresses).values({
      orderId,
      firstName: shipping.firstName,
      lastName: shipping.lastName,
      email: shipping.email,
      phone: shipping.phone,
      street: shipping.street,
      city: shipping.city,
      state: shipping.state,
      zip: shipping.zip,
    })

    await tx.insert(orderItems).values(
      lines.map((l) => ({
        orderId,
        productId: l.product.id,
        quantity: l.quantity,
        unitPrice: money(l.unitPrice),
      }))
    )

    if (userId) {
      const cartRow = await tx
        .select({ id: cart.id })
        .from(cart)
        .where(eq(cart.userId, userId))
        .limit(1)
      const cartId = cartRow[0]?.id
      if (cartId) {
        if (itemsInput && itemsInput.length > 0) {
          await tx
            .delete(cartItems)
            .where(
              and(
                eq(cartItems.cartId, cartId),
                inArray(cartItems.productId, itemsInput.map((i) => i.productId))
              )
            )
        } else {
          await tx.delete(cartItems).where(eq(cartItems.cartId, cartId))
        }
        await tx.update(cart).set({ updatedAt: new Date() }).where(eq(cart.id, cartId))
      }
    }

    return { orderId }
  })

  return NextResponse.json({ id: result.orderId })
}
