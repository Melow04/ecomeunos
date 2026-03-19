import { Mountain, DollarSign, ShoppingCart, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDb } from '@/db'
import { orders, orderItems, products, users } from '@/db/schema'
import { sql, sum, desc, eq } from 'drizzle-orm'

export default async function AdminAnalyticsPage() {
  const db = await getDb()

  // Basic Stats
  const [orderStats, userStats, revenueStats] = await Promise.all([
    db.select({count: sql<number>`count(*)` }).from(orders),
    db.select({count: sql<number>`count(*)` }).from(users),
    db.select({total: sum(orders.total)}).from(orders)
  ])

  const totalRevenue = revenueStats[0]?.total ?? '0'
  const totalOrders = orderStats[0]?.count ?? 0
  const totalUsers = userStats[0]?.count ?? 0

  // Top Products
  const topProductsCarts = await db.select({
    id: products.id,
    name: products.name,
    revenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPrice})`,
    sold: sum(orderItems.quantity)
  })
  .from(orderItems)
  .innerJoin(products, eq(orderItems.productId, products.id))
  .groupBy(products.id, products.name)
  .orderBy(desc(sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPrice})`))
  .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black">Analytics</h1>
        <div className="mt-1 text-sm font-semibold text-black/60">Overview of metrics and performance.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white border-black/10 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-black/70">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">${Number(totalRevenue).toFixed(2)}</div>
            <p className="text-xs text-black/50 mt-1 font-medium">Cumulative earnings</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-black/10 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-black/70">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">{totalOrders}</div>
            <p className="text-xs text-black/50 mt-1 font-medium">Successful purchases</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-black/10 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-black/70">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">{totalUsers}</div>
            <p className="text-xs text-black/50 mt-1 font-medium">Registered accounts</p>
          </CardContent>
        </Card>
        <Card className="bg-white border-black/10 shadow-sm rounded-xl">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-bold text-black/70">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-black/50" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-black">
              ${(totalOrders > 0 ? Number(totalRevenue) / totalOrders : 0).toFixed(2)}
            </div>
            <p className="text-xs text-black/50 mt-1 font-medium">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border-black/10 shadow-sm rounded-xl p-6 overflow-hidden">
        <h3 className="text-lg text-black font-black mb-6">Top Products by Revenue</h3>
        <div className="divide-y divide-black/5">
          {topProductsCarts.length === 0 ? (
            <div className="py-8 text-center text-sm font-medium text-black/50">No sales data yet.</div>
          ) : (
            topProductsCarts.map((p, o) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 rounded-full bg-black/5 flex items-center justify-center text-sm font-black">
                    {o + 1}
                  </div>
                  <div className="font-bold text-sm text-black">{p.name}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-black">${Number(p.revenue).toFixed(2)}</div>
                  <div className="text-xs font-bold text-black/50">{p.sold} sold</div>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}