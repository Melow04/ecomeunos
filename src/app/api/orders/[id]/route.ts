import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { orderItems, orders, products, shippingAddresses } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const { id } = await params

  const orderRow = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  const order = orderRow[0]
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const [items, shipping] = await Promise.all([
    db
      .select({
        id: orderItems.id,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, id)),
    db
      .select()
      .from(shippingAddresses)
      .where(eq(shippingAddresses.orderId, id))
      .limit(1),
  ])

  return NextResponse.json({ order, items, shipping: shipping[0] ?? null })
}
