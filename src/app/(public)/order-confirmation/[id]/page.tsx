import Link from 'next/link'

import { getDb } from '@/db'
import { orderItems, orders, products, shippingAddresses } from '@/db/schema'
import { Card } from '@/components/ui/card'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function estimate(method: 'standard' | 'express' | 'overnight') {
  if (method === 'overnight') return 'Tomorrow'
  if (method === 'express') return '2–3 business days'
  return '5–7 business days'
}

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const db = getDb()
  const { id } = await params

  const orderRow = await db.select().from(orders).where(eq(orders.id, id)).limit(1)
  const order = orderRow[0]
  if (!order) notFound()

  const [items, shipping] = await Promise.all([
    db
      .select({
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        product: products,
      })
      .from(orderItems)
      .innerJoin(products, eq(products.id, orderItems.productId))
      .where(eq(orderItems.orderId, id)),
    db.select().from(shippingAddresses).where(eq(shippingAddresses.orderId, id)).limit(1),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brown">Your order has been confirmed!</h1>
        <div className="mt-2 text-sm text-muted">Order number: {order.id}</div>
        <div className="mt-1 text-sm text-muted">Estimated delivery: {estimate(order.shippingMethod)}</div>
      </div>

      <Card className="p-6">
        <div className="text-sm font-semibold text-brown">Order Details</div>
        <div className="mt-3 space-y-2 text-sm">
          {items.map((i, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-brown/80">
                {i.product.name} × {i.quantity}
              </span>
              <span className="font-semibold text-brown">${i.unitPrice}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 border-t border-brown/10 pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-brown">${order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-semibold text-brown">${order.shippingCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="font-semibold text-brown">${order.tax}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-brown/10 pt-3">
            <span className="text-brown">Total</span>
            <span className="text-base font-semibold text-brown">${order.total}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/90"
            href="/account"
          >
            View Order Details
          </Link>
          <Link
            className="rounded-md border border-brown/15 bg-white px-4 py-2 text-sm font-semibold text-brown hover:bg-brown/5"
            href="/products"
          >
            Continue Shopping
          </Link>
        </div>
        <div className="mt-4 text-xs text-muted">
          Shipping to: {shipping[0]?.street}, {shipping[0]?.city}, {shipping[0]?.state} {shipping[0]?.zip}
        </div>
      </Card>
    </div>
  )
}
