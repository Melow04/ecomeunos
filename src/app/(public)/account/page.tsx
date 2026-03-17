import { redirect } from 'next/navigation'

import { getDb } from '@/db'
import { orders } from '@/db/schema'
import { auth } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const session = await auth()
  if (!session?.user?.id) redirect('/auth/login')

  const db = getDb()

  const sp = await searchParams
  const tab = typeof sp.tab === 'string' ? sp.tab : 'orders'

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))
    .limit(50)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brown">My Account</h1>
        <div className="mt-1 text-sm text-muted">Signed in as {session.user.email}</div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/account?tab=orders"
          className={
            tab === 'orders'
              ? 'rounded-md bg-brown/10 px-3 py-1 text-sm font-semibold text-brown'
              : 'rounded-md px-3 py-1 text-sm text-brown/70 hover:bg-brown/5'
          }
        >
          Order History
        </Link>
        <Link
          href="/account?tab=wishlist"
          className={
            tab === 'wishlist'
              ? 'rounded-md bg-brown/10 px-3 py-1 text-sm font-semibold text-brown'
              : 'rounded-md px-3 py-1 text-sm text-brown/70 hover:bg-brown/5'
          }
        >
          Wishlist
        </Link>
      </div>

      {tab === 'wishlist' ? (
        <Card className="p-6 text-sm text-muted">Wishlist UI placeholder.</Card>
      ) : (
        <Card className="p-6">
          <div className="text-sm font-semibold text-brown">Orders</div>
          <div className="mt-4 space-y-2 text-sm">
            {rows.length === 0 ? (
              <div className="text-muted">No orders yet.</div>
            ) : (
              rows.map((o) => (
                <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-brown/10 bg-white px-4 py-3">
                  <div>
                    <div className="font-semibold text-brown">{o.id}</div>
                    <div className="text-xs text-muted">{new Date(o.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-brown">${o.total}</div>
                    <div className="text-xs text-muted">{o.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  )
}
