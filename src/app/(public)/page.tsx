import Link from 'next/link'
import { desc, eq } from 'drizzle-orm'
import { CheckSquare, Truck, RotateCcw } from 'lucide-react'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/product/ProductCard'

export const dynamic = 'force-dynamic'

export default async function StorefrontPage() {
  const db = getDb()
  
  // Try to load items explicitly flagged, fallback to latest if not enough exist yet
  const featuredDb = await db.select().from(products).where(eq(products.isFeatured, true)).orderBy(desc(products.createdAt)).limit(4)
  const newArrivalsDb = await db.select().from(products).where(eq(products.isNew, true)).orderBy(desc(products.createdAt)).limit(4)

  const fallback = await db.select().from(products).orderBy(desc(products.createdAt)).limit(8)
  
  const featured = featuredDb.length >= 4 ? featuredDb : fallback.slice(0, 4)
  const newArrivals = newArrivalsDb.length >= 4 ? newArrivalsDb : fallback.slice(4, 8)

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section 
        className="relative px-4 py-20 text-white md:px-12 md:py-32 w-full rounded-2xl overflow-hidden bg-cover bg-center shadow-sm"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80")' }}
      >
        <div className="absolute inset-0 bg-primary/80"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col items-start pr-4 relative z-10">
          <p className="mb-2 text-sm text-white/90 font-medium drop-shadow-sm">Gear Up for Your Next</p>
          <h1 className="text-5xl font-extrabold md:text-[64px] leading-tight max-w-3xl drop-shadow-md">
            Gear Up for Your Next<br />Adventure
          </h1>
          <div className="mt-10 flex flex-wrap gap-4 drop-shadow-sm">
            <Button asChild className="bg-white text-brown hover:bg-white/90 rounded-full px-8 h-12 font-bold shadow-none text-sm">
              <Link href="/products">SHOP NOW →</Link>
            </Button>
            <Button asChild variant="outline" className="border-2 border-white bg-transparent text-white hover:bg-white/20 backdrop-blur-sm rounded-full px-8 h-12 font-bold shadow-none text-sm">
              <Link href="/products">View Categories</Link>
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {/* Shop by Category */}
        <section>
          <h2 className="text-center text-3xl font-extrabold text-brown">Shop by Category</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                name: 'Camping',
                description: 'Tents, sleeping bags, and essential camping gear',
                href: '/products?category=camping',
                image: 'https://images.unsplash.com/photo-1504280390227-bb25b84e3065?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Hiking',
                description: 'Backpacks, trekking poles, and trail essentials',
                href: '/products?category=hiking',
                image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=400&q=80',
              },
              {
                name: 'Clothing',
                description: 'Jackets, boots, and outdoor apparel',
                href: '/products?category=clothing',
                image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=400&q=80',
              },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm hover:shadow-md transition-all text-center"
              >
                <div className="p-10 flex flex-col items-center">
                  <div 
                    className="mb-6 h-28 w-28 rounded-full bg-[#f3f1ea] group-hover:scale-105 transition-transform bg-cover bg-center shadow-inner" 
                    style={{ backgroundImage: `url("${category.image}")` }}
                  />
                  <h3 className="text-xl font-bold text-brown">{category.name}</h3>
                  <p className="mt-2 text-sm text-muted px-4 leading-relaxed">{category.description}</p>
                </div>
                <div className="mt-auto bg-[#f3f1ea]/60 py-3 text-sm font-semibold text-brown group-hover:bg-[#f3f1ea] transition-colors">
                  Explore →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Featured Deals */}
        <section>
          <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-8">
            <h2 className="text-2xl font-extrabold text-brown">Featured Deals</h2>
            <Link href="/products" className="text-sm font-bold text-brown hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
            {featured.map((p) => (
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
                  isFeatured: p.isFeatured,
                  isNew: p.isNew,
                  isSale: p.isSale,
                }}
              />
            ))}
          </div>
        </section>

        {/* New Arrivals */}
        <section>
          <div className="flex items-center justify-between border-b border-black/5 pb-4 mb-8">
            <h2 className="text-2xl font-extrabold text-brown">New Arrivals</h2>
            <Link href="/products" className="text-sm font-bold text-brown hover:underline">
              View All
            </Link>
          </div>

          <div className="mt-6 grid gap-6 grid-cols-2 md:grid-cols-4">
            {newArrivals.map((p) => (
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
                  isFeatured: p.isFeatured,
                  isNew: p.isNew,
                  isSale: p.isSale,
                }}
              />
            ))}
          </div>
        </section>

        {/* Trust Badges */}
        <section className="mt-24 mb-12 flex flex-col md:flex-row items-center justify-center gap-12 md:gap-24">
          {[
            { icon: CheckSquare, title: 'Secure Payment', desc: 'Multiple payment options available' },
            { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '30-day return policy' },
          ].map((badge) => (
            <div key={badge.title} className="text-center flex flex-col items-center">
              <div className="mb-4 flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary text-white">
                <badge.icon className="h-8 w-8 stroke-[1.5]" />
              </div>
              <h3 className="font-bold text-brown">{badge.title}</h3>
              <p className="mt-1 text-xs text-muted max-w-[200px]">{badge.desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
