import Link from 'next/link'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function StorefrontPage() {
  const db = getDb()
  const featured = await db.select().from(products).orderBy(desc(products.createdAt)).limit(8)

  return (
    <div className="space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="rounded-2xl bg-gradient-to-br from-primary to-primary/90 px-8 py-20 text-white md:rounded-3xl md:px-12 md:py-32">
        <div className="max-w-2xl">
          <p className="text-sm font-medium opacity-90">Gear Up for Your Next</p>
          <h1 className="mt-3 text-5xl font-bold md:text-6xl leading-tight">Adventure</h1>
          <p className="mt-4 text-base opacity-90">Everything you need for camping, hiking, and outdoor exploration.</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Button asChild className="bg-white text-primary hover:bg-white/90">
              <Link href="/products">SHOP NOW</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/10">
              <Link href="/products">View Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section>
        <h2 className="text-center text-3xl font-bold text-brown">Shop by Category</h2>
        <p className="mt-2 text-center text-muted">Browse our curated collections</p>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              name: 'Camping',
              description: 'Tents, sleeping bags, and outdoor essentials',
              href: '/products?category=camping',
            },
            {
              name: 'Hiking',
              description: 'Backpacks, trekking poles, and trail essentials',
              href: '/products?category=hiking',
            },
            {
              name: 'Clothing',
              description: 'Jackets, boots, and outdoor apparel',
              href: '/products?category=clothing',
            },
          ].map((category) => (
            <Link
              key={category.name}
              href={category.href}
              className="group rounded-2xl border border-primary/15 bg-white p-8 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all"
            >
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-beige to-primary/20 group-hover:from-primary/10 transition-colors">
                <div className="h-20 w-20 rounded-full bg-primary/30 group-hover:bg-primary/40 transition-colors"></div>
              </div>
              <h3 className="mt-6 text-xl font-bold text-brown group-hover:text-primary transition-colors">{category.name}</h3>
              <p className="mt-2 text-sm text-muted">{category.description}</p>
              <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                Explore
                <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Deals */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brown">Featured Deals</h2>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {featured.slice(0, 4).map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                stock: p.stock,
                status: p.status,
                images: p.images,
              }}
            />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-brown">New Arrivals</h2>
          <Link href="/products" className="text-sm font-semibold text-primary hover:underline">
            View All
          </Link>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {featured.slice(4, 8).map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                price: p.price,
                category: p.category,
                stock: p.stock,
                status: p.status,
                images: p.images,
              }}
            />
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="mt-20 grid gap-8 md:grid-cols-3 py-12">
        {[
          { icon: '✓', title: 'Secure Payment', desc: 'Multiple payment options available' },
          { icon: '✓', title: 'Free Shipping', desc: 'On orders over $100' },
          { icon: '✓', title: 'Easy Returns', desc: '30-day return policy' },
        ].map((badge) => (
          <div key={badge.title} className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/80 text-white text-xl font-bold shadow-md">
                {badge.icon}
              </div>
            </div>
            <h3 className="font-semibold text-brown">{badge.title}</h3>
            <p className="mt-2 text-sm text-muted">{badge.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
