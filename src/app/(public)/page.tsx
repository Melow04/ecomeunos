import Link from 'next/link'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function StorefrontPage() {
  const db = getDb()
  const featured = await db.select().from(products).orderBy(desc(products.createdAt)).limit(8)

  return (
    <div className="space-y-10">
      <section className="rounded-2xl border border-brown/10 bg-white p-8 shadow-sm">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <div className="text-sm font-semibold text-primary">Eco-ready outdoors</div>
            <h1 className="mt-2 text-3xl font-semibold text-brown md:text-4xl">
              Sustainable camping and hiking essentials
            </h1>
            <p className="mt-3 text-sm text-muted">
              Shop curated gear built to last, from trail to campsite.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/products">Shop All</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/products?category=camping">Browse Camping</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-beige p-6">
            <div className="grid grid-cols-3 gap-3 text-sm">
              <Link
                className="rounded-lg border border-brown/10 bg-white p-4 hover:bg-brown/5"
                href="/products?category=camping"
              >
                Camping
              </Link>
              <Link
                className="rounded-lg border border-brown/10 bg-white p-4 hover:bg-brown/5"
                href="/products?category=hiking"
              >
                Hiking
              </Link>
              <Link
                className="rounded-lg border border-brown/10 bg-white p-4 hover:bg-brown/5"
                href="/products?category=clothing"
              >
                Clothing
              </Link>
            </div>
            <div className="mt-4 text-xs text-muted">New drops weekly • Free returns (demo)</div>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold text-brown">New Arrivals</h2>
          <Link href="/products" className="text-sm text-primary hover:underline">
            View all
          </Link>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          {featured.map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="line-clamp-1 text-sm">{p.name}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="text-sm text-muted line-clamp-2">{p.description}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm font-semibold text-brown">${p.price}</div>
                  <Button asChild size="sm" variant="secondary">
                    <Link href={`/products/${p.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  )
}
