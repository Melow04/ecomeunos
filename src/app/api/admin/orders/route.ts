import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { orders, shippingAddresses, users } from '@/db/schema'
import { requireAdmin } from '@/lib/server-auth'
import { desc, eq } from 'drizzle-orm'

export async function GET() {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const rows = await db
    .select({
      order: orders,
      customerEmail: users.email,
      shippingEmail: shippingAddresses.email,
      shippingFirstName: shippingAddresses.firstName,
      shippingLastName: shippingAddresses.lastName,
    })
    .from(orders)
    .leftJoin(users, eq(users.id, orders.userId))
    .leftJoin(shippingAddresses, eq(shippingAddresses.orderId, orders.id))
    .orderBy(desc(orders.createdAt))
    .limit(200)

  return NextResponse.json({ items: rows })
}
