import { getDb } from '@/db'
import { orders, products, users } from '@/db/schema'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { desc, sql } from 'drizzle-orm'
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function statusVariant(status: string): BadgeVariant {
  if (status === 'pending') return 'yellow'
  if (status === 'processing') return 'blue'
  if (status === 'shipped') return 'blue'
  if (status === 'delivered') return 'green'
  return 'red'
}

function getStatusBadgeColor(status: string) {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (status === 'processing' || status === 'shipped') return 'bg-blue-100 text-blue-800'
  if (status === 'delivered') return 'bg-green-100 text-green-800'
  return 'bg-red-100 text-red-800'
}

export default async function AdminDashboardPage() {
  const db = getDb()
  const [revenueRows, ordersRows, productsRows, customersRows, recent] = await Promise.all([
    db.select({ sum: sql<string | null>`coalesce(sum(${orders.total}), 0)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(orders),
    db.select({ count: sql<number>`count(*)` }).from(products),
    db.select({ count: sql<number>`count(*)` }).from(users),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(5),
  ])

  const metrics = [
    {
      label: 'Total Revenue',
      value: `$${revenueRows[0]?.sum ?? '0.00'}`,
      change: '+12.5%',
      icon: TrendingUp,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
    {
      label: 'Total Orders',
      value: String(Number(ordersRows[0]?.count ?? 0)),
      change: '+8.2%',
      icon: ShoppingBag,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
    },
    {
      label: 'Products',
      value: String(Number(productsRows[0]?.count ?? 0)),
      change: '+3',
      icon: Package,
      bgColor: 'bg-purple-100',
      iconColor: 'text-purple-600',
    },
    {
      label: 'Customers',
      value: String(Number(customersRows[0]?.count ?? 0)),
      change: '+125',
      icon: Users,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-brown">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Key metrics and recent activity</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-6 border-0 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase">{metric.label}</p>
                  <p className="mt-3 text-3xl font-bold text-brown">{metric.value}</p>
                  <p className="mt-2 text-xs font-semibold text-green-600">{metric.change}</p>
                </div>
                <div className={`rounded-lg p-3 ${metric.bgColor}`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <Card className="p-6 border-0 shadow-sm">
        <h2 className="text-lg font-bold text-brown mb-6">Recent Orders</h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-brown/10">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Customer</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Amount</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id} className="border-b border-brown/10 hover:bg-brown/2">
                  <td className="px-4 py-4 font-semibold text-brown">{o.id}</td>
                  <td className="px-4 py-4 text-sm text-muted">Customer</td>
                  <td className="px-4 py-4 font-semibold text-brown">${o.total}</td>
                  <td className="px-4 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(o.status)}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-muted">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
