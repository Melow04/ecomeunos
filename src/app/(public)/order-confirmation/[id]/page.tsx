import Link from 'next/link'

import { getDb } from '@/db'
import { orderItems, orders, products, shippingAddresses } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

function estimate(method: 'standard' | 'express' | 'overnight') {
  if (method === 'overnight') return { date: 'Tomorrow', range: '1 business day' }
  if (method === 'express') return { date: 'Feb 12-14', range: '2–3 business days' }
  return { date: 'Feb 12-14', range: '5–7 business days' }
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

  const est = estimate(order.shippingMethod)

  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-8">
      <div className="rounded-full bg-[#a8b896] p-8">
        <div className="flex h-20 w-20 items-center justify-center rounded-full text-white text-5xl">
          ✓
        </div>
      </div>

      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-brown">Your order has been confirmed!</h1>
        <p className="text-sm text-muted">Thank you for your purchase. We've received your order and will begin processing it shortly.</p>
      </div>

      <Card className="w-full max-w-xl rounded-2xl border-2 border-brown/10 p-6">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted uppercase">Your order number is</div>
            <div className="text-3xl font-bold text-brown">{order.id}</div>
          </div>

          <p className="text-xs text-muted">A confirmation email has been sent to your email address with additional order details.</p>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg border border-brown/10 bg-beige/50 p-4">
              <div className="text-xs font-semibold text-muted uppercase mb-2">Estimated Delivery</div>
              <div className="text-lg font-bold text-brown">{est.date}</div>
              <div className="text-xs text-muted mt-1">{est.range}</div>
            </div>
            <button className="rounded-lg border border-brown/10 bg-white p-4 hover:bg-brown/5 text-center">
              <div className="text-xs font-semibold text-muted uppercase mb-2">Track Your Order</div>
              <div className="text-lg font-bold text-brown">→</div>
            </button>
          </div>

          <div className="space-y-2 border-t border-brown/10 pt-6">
            <p className="text-xs text-muted">In the meantime, you can:</p>
            <div className="flex gap-3">
              <Button asChild className="flex-1" variant="secondary">
                <Link href={`/account?tab=orders&orderId=${order.id}`}>View Your Order Details</Link>
              </Button>
              <Button asChild className="flex-1" variant="outline">
                <Link href="/products">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Order Details Section */}
      <Card className="w-full max-w-xl rounded-2xl border-2 border-brown/10 p-6">
        <h2 className="font-bold text-brown mb-4">Order Summary</h2>
        <div className="space-y-3 text-sm border-b border-brown/10 pb-4">
          {items.map((i, idx) => (
            <div key={idx} className="flex justify-between">
              <span className="text-muted">
                {i.product.name} × {i.quantity}
              </span>
              <span className="font-semibold text-brown">${(Number(i.unitPrice) * i.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="text-brown font-medium">${order.subtotal}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="text-brown font-medium">${order.shippingCost}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax</span>
            <span className="text-brown font-medium">${order.tax}</span>
          </div>
          <div className="flex justify-between border-t border-brown/10 pt-3 mt-3">
            <span className="font-bold text-brown">Total</span>
            <span className="text-lg font-bold text-brown">${order.total}</span>
          </div>
        </div>

        {shipping[0] && (
          <div className="mt-4 pt-4 border-t border-brown/10">
            <div className="text-xs font-semibold text-muted uppercase mb-2">Shipping To</div>
            <div className="text-sm text-brown">
              {shipping[0].street}<br/>
              {shipping[0].city}, {shipping[0].state} {shipping[0].zip}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}
