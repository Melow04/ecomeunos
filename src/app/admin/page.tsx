import { getDb } from '@/db'
import { orders, products, users } from '@/db/schema'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { desc, sql } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

function statusVariant(status: string): BadgeVariant {
  if (status === 'pending') return 'yellow'
  if (status === 'processing') return 'blue'
  if (status === 'shipped') return 'blue'
  if (status === 'delivered') return 'green'
  return 'red'
}

export default async function AdminDashboardPage() {
  const db = getDb()
  const [revenueRows, ordersRows, productsRows, customersRows, recent] = await Promise.all([
    db.select({ sum: sql<string | null>`coalesce(sum(${orders.total}), 0)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brown">Dashboard</h1>
        <div className="mt-1 text-sm text-muted">Key metrics and recent activity</div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Total Revenue</div>
          <div className="mt-2 text-2xl font-semibold text-brown">${revenueRows[0]?.sum ?? '0.00'}</div>
          <div className="mt-2 text-xs text-muted">+0% (demo)</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Total Orders</div>
          <div className="mt-2 text-2xl font-semibold text-brown">{Number(ordersRows[0]?.count ?? 0)}</div>
          <div className="mt-2 text-xs text-muted">+0% (demo)</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Products</div>
          <div className="mt-2 text-2xl font-semibold text-brown">{Number(productsRows[0]?.count ?? 0)}</div>
          <div className="mt-2 text-xs text-muted">+0% (demo)</div>
        </Card>
        <Card className="p-5">
          <div className="text-xs font-semibold text-muted">Customers</div>
          <div className="mt-2 text-2xl font-semibold text-brown">{Number(customersRows[0]?.count ?? 0)}</div>
          <div className="mt-2 text-xs text-muted">+0% (demo)</div>
        </Card>
      </div>

      <Card className="p-6">
        <div className="text-sm font-semibold text-brown">Recent Orders</div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2">Order ID</th>
                <th className="py-2">Amount</th>
                <th className="py-2">Status</th>
                <th className="py-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-t border-brown/10">
                  <td className="py-3 font-medium text-brown">{o.id}</td>
                  <td className="py-3 text-brown">${o.total}</td>
                  <td className="py-3">
                    <Badge variant={statusVariant(o.status)}>{o.status}</Badge>
                  </td>
                  <td className="py-3 text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
