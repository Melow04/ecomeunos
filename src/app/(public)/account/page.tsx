import { redirect } from 'next/navigation'

import { getDb } from '@/db'
import { orders, products, wishlists } from '@/db/schema'
import { auth } from '@/lib/auth'
import { Card } from '@/components/ui/card'
import { desc, eq } from 'drizzle-orm'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ProductCard, ProductForCard } from '@/components/product/ProductCard'

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
  const tab = typeof sp.tab === 'string' ? sp.tab : 'dashboard'

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, session.user.id))
    .orderBy(desc(orders.createdAt))
    .limit(50)

  // Fetch wishlist
  const userWishlists = await db
    .select({ product: products })
    .from(wishlists)
    .innerJoin(products, eq(wishlists.productId, products.id))
    .where(eq(wishlists.userId, session.user.id))

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl font-semibold text-brown">My Account</h1>
        <div className="mt-1 text-sm text-muted">Signed in as {session.user.email}</div>
      </div>

      <div className="flex gap-2 border-b border-brown/10 pb-2 overflow-x-auto">
        <Link
          href="/account?tab=dashboard"
          className={
            tab === 'dashboard'
              ? 'rounded-md bg-brown/10 px-3 py-1 text-sm font-semibold text-brown whitespace-nowrap'
              : 'rounded-md px-3 py-1 text-sm text-brown/70 hover:bg-brown/5 whitespace-nowrap'
          }
        >
          Dashboard
        </Link>
        <Link
          href="/account?tab=settings"
          className={
            tab === 'settings'
              ? 'rounded-md bg-brown/10 px-3 py-1 text-sm font-semibold text-brown whitespace-nowrap'
              : 'rounded-md px-3 py-1 text-sm text-brown/70 hover:bg-brown/5 whitespace-nowrap'
          }
        >
          Settings
        </Link>
        <Link
          href="/account?tab=orders"
          className={
            tab === 'orders'
              ? 'rounded-md bg-brown/10 px-3 py-1 text-sm font-semibold text-brown whitespace-nowrap'
              : 'rounded-md px-3 py-1 text-sm text-brown/70 hover:bg-brown/5 whitespace-nowrap'
          }
        >
          Order History
        </Link>
        <Link
          href="/account?tab=wishlist"
          className={
            tab === 'wishlist'
              ? 'rounded-md bg-brown/10 px-3 py-1 text-sm font-semibold text-brown whitespace-nowrap'
              : 'rounded-md px-3 py-1 text-sm text-brown/70 hover:bg-brown/5 whitespace-nowrap'
          }
        >
          Wishlist
        </Link>
      </div>

      {tab === 'dashboard' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-brown mb-4">Welcome back, {session.user.name}</h2>
          <p className="text-sm text-muted">From your account dashboard you can view your recent orders and edit your account details.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
             <Card className="p-4 bg-beige/30">
               <h3 className="font-semibold text-brown">Recent Orders</h3>
               <p className="text-sm text-muted mb-3">You have {rows.length} orders.</p>
               <Button asChild variant="outline" size="sm">
                 <Link href="/account?tab=orders">View Orders</Link>
               </Button>
             </Card>
             <Card className="p-4 bg-beige/30">
               <h3 className="font-semibold text-brown">Account Settings</h3>
               <p className="text-sm text-muted mb-3">Update your profile info.</p>
               <Button asChild variant="outline" size="sm">
                 <Link href="/account?tab=settings">Edit Settings</Link>
               </Button>
             </Card>
          </div>
        </Card>
      )}

      {tab === 'settings' && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-brown mb-4">Account Settings</h2>
          <form className="space-y-4 max-w-sm">
            <div className="space-y-2">
              <label className="text-sm font-medium text-brown">Full Name</label>
              <Input defaultValue={session.user.name || ''} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brown">Email</label>
              <Input type="email" defaultValue={session.user.email || ''} readOnly className="bg-gray-50 cursor-not-allowed" />
              <p className="text-xs text-muted">Email cannot be changed right now.</p>
            </div>
            <Button type="button">Save Changes</Button>
          </form>
        </Card>
      )}

      {tab === 'wishlist' && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-brown hidden md:block">My Wishlist</h2>
          {userWishlists.length === 0 ? (
            <Card className="p-6 text-sm text-muted text-center">Your wishlist is empty.</Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userWishlists.map(w => (
                <ProductCard key={w.product.id} product={w.product as unknown as ProductForCard} />
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
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
