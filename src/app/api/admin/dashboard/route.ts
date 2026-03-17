import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { orders, products, users } from '@/db/schema'
import { requireAdmin } from '@/lib/server-auth'
import { sql } from 'drizzle-orm'

export async function GET() {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [revenueRows, ordersRows, productsRows, customersRows] = await Promise.all([
    db.select({ sum: sql<string | null>`coalesce(sum(${orders.total}), 0)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(users),
  ])

  return NextResponse.json({
    totalRevenue: revenueRows[0]?.sum ?? '0.00',
    totalOrders: Number(ordersRows[0]?.count ?? 0),
    productsCount: Number(productsRows[0]?.count ?? 0),
    customersCount: Number(customersRows[0]?.count ?? 0),
    change: {
      totalRevenuePct: 0,
      totalOrdersPct: 0,
      productsCountPct: 0,
      customersCountPct: 0,
    },
  })
}
