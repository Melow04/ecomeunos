import Link from 'next/link'

import { getDb } from '@/db'
import { orderItems, orders, products, shippingAddresses } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { eq } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Check } from 'lucide-react'

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
    <div className="flex flex-col items-center justify-center py-16 space-y-10 max-w-3xl mx-auto px-4">
      {/* Icon Circle */}
      <div className="flex items-center justify-center">
        <div className="rounded-full bg-[#f0ece1] p-3">
          <div className="rounded-full bg-primary p-4 text-white shadow-lg">
            <Check className="h-10 w-10 stroke-[3]" />
          </div>
        </div>
      </div>

      {/* Header Info */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight">Order Verified!</h1>
        <p className="text-xl font-bold text-black/70">Thank you!</p>
        <p className="text-lg font-bold text-black/80 mt-6 inline-block bg-black/5 px-6 py-2 rounded-full">
          Order ID: #{order.id.slice(0, 8).toUpperCase()}
        </p>
      </div>

      <Card className="w-full rounded-xl border border-black/10 shadow-sm p-8 md:p-10 bg-white">
        <div className="text-center space-y-8">
          <p className="text-base text-black/70">
            A confirmation email has been sent to your email address with additional order details.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-black/10 bg-[#f0ece1] p-6 flex flex-col items-center justify-center">
              <div className="text-sm font-bold text-black/60 uppercase tracking-wider mb-2">Estimated Delivery</div>
              <div className="text-2xl font-black text-black">{est.date}</div>
              <div className="text-sm font-semibold text-black/60 mt-1">{est.range}</div>
            </div>
            <Link href={`/account?tab=orders&orderId=${order.id}`} className="rounded-lg border border-black/10 bg-white p-6 hover:bg-black/5 transition-colors flex flex-col items-center justify-center text-center group cursor-pointer">
              <div className="text-sm font-bold text-black/60 uppercase tracking-wider mb-2">Track Your Order</div>
              <div className="text-2xl font-black text-black group-hover:translate-x-2 transition-transform">→</div>
            </Link>
          </div>

          <div className="space-y-4 pt-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
              <Button asChild className="flex-1 sm:max-w-xs h-14 text-base bg-primary hover:bg-[#859271] text-white font-bold shadow-none rounded-md">
                <Link href="/products">Continue Shopping</Link>
              </Button>
              <Button asChild className="flex-1 sm:max-w-xs h-14 text-base border-2 border-black/20 text-black hover:bg-black/5 font-bold shadow-none rounded-md" variant="outline">
                <Link href="/account">Go to Account</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>
      
      {/* Short Summary */}
      <div className="w-full text-center text-sm font-semibold text-black/50">
        Total paid: ${order.total} • {items.length} item{items.length !== 1 ? 's' : ''}
      </div>
    </div>
  )
}
