import { getDb } from '@/db'
import { orders, products, users } from '@/db/schema'
import { Card } from '@/components/ui/card'
import { desc, sql } from 'drizzle-orm'
import { TrendingUp, ShoppingBag, Package, Users } from 'lucide-react'

export const dynamic = 'force-dynamic'

function getStatusBadgeColor(status: string) {
  switch(status) {
    case 'pending': return 'bg-orange-200 text-orange-800'
    case 'processing':
    case 'shipped': return 'bg-blue-300 text-blue-800'
    case 'delivered': return 'bg-green-400 text-green-900'
    default: return 'bg-red-400 text-red-900'
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
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600'
    },
    {
      label: 'Total Orders',
      value: String(Number(ordersRows[0]?.count ?? 0)),
      change: '+8.2%',
      icon: ShoppingBag,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Products',
      value: String(Number(productsRows[0]?.count ?? 0)),
      change: '+3',
      icon: Package,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600'
    },
    {
      label: 'Customers',
      value: String(Number(customersRows[0]?.count ?? 0)),
      change: '+125',
      icon: Users,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    }
  ]

  return (
    <div className="space-y-8 max-w[1400px] w-full mx-auto">
      <div className="grid gap-6 md:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon
          return (
            <Card key={metric.label} className="p-8 border border-black/10 shadow-sm rounded-2xl bg-white h-full flex flex-col justify-between">
              <div className="flex justify-between items-start mb-8">
                <div className={`px-3 py-3 rounded-xl ${metric.iconBg}`}>
                  <Icon className={`h-6 w-6 ${metric.iconColor}`} strokeWidth={2.5} />
                </div>
                <div className="text-sm font-bold text-green-600">{metric.change}</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-black mb-1">{metric.value}</div>
                <div className="text-xs font-bold text-black/50 uppercase tracking-wider">{metric.label}</div>
              </div>
            </Card>
          )
        })}
      </div>

      <Card className="p-8 border border-black/10 shadow-sm rounded-2xl bg-white">
        <h2 className="text-2xl font-bold text-black mb-8">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="border-b border-black/10 text-black">
              <tr>
                <th className="px-4 py-4 font-bold">Order ID</th>
                <th className="px-4 py-4 font-bold">Customer</th>
                <th className="px-4 py-4 font-bold">Amount</th>
                <th className="px-4 py-4 font-bold">Status</th>
                <th className="px-4 py-4 font-bold">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {recent.map((o) => (
                <tr key={o.id} className="hover:bg-black/5">
                  <td className="px-4 py-6 font-bold text-black">ORD-{o.id.toString().padStart(3, '0')}</td>
                  <td className="px-4 py-6 font-medium text-black/80">Customer</td>
                  <td className="px-4 py-6 font-bold text-black">${o.total}</td>
                  <td className="px-4 py-6">
                    <span className={`px-3 py-1 rounded-full text-[11px] font-extrabold ${getStatusBadgeColor(o.status)}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="px-4 py-6 font-medium text-black/80">
                    {(new Date(o.createdAt)).toISOString().split('T')[0]}
                  </td>
                </tr>
              ))}
              {recent.length === 0 && (
                <tr>
                  <td colSpan= {5} className="px-4 py-8 text-center text-black/60">
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
