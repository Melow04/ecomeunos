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
  switch(status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing':
    case 'shipped': return 'bg-blue-100 text-blue-800'
    case 'delivered': return 'bg-green-100 text-green-800'
    default: return 'bg-red-100 text-red-800'
  }
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
    },
    {
      label: 'Active Orders',
      value: String(Number(ordersRows[0]?.count ?? 0)),
      change: '+8.2%',
      icon: ShoppingBag,
    },
    {
      label: 'Total Customers',
      value: String(Number(customersRows[0]?.count ?? 0)),
      change: '+15.3%',
      icon: Users,
    },
    {
      label: 'Products',
      value: String(Number(productsRows[0]?.count ?? 0)),
      change: '+3.1%',
      icon: Package,
    }
  ]

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-[32px] font-bold text-black tracking-tight">Dashboard</h1>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-6 border border-black/10 shadow-sm rounded-xl">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-3 text-black/70">
                  <Icon className="h-5 w-5" />
                  <span className="font-semibold text-sm">{metric.label}</span>
                </div>
                <div>
                  <div className="text-[32px] font-black text-black leading-none">{metric.value}</div>
                  <div className="mt-2 text-sm font-semibold text-green-700 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    {metric.change}
                  </div>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      {/* Recent Orders */}
      <h2 className="text-xl font-bold text-black pt-4">Recent Orders</h2>
      <Card className="border border-black/10 shadow-sm rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#f0ece1] text-black">
              <tr>
                <th className="px-6 py-4 font-bold">Order ID</th>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Amount</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 bg-white">
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-black">{o.id}</td>
                  <td className="px-6 py-4 font-medium text-black/70">Customer</td>
                  <td className="px-6 py-4 font-bold text-black">${o.total}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeColor(o.status)}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-black/70">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-black/60">
                    No recent orders.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
