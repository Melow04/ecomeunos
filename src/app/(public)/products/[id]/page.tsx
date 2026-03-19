import Image from 'next/image'
import Link from 'next/link'

import { getDb } from '@/db'
import { products, reviews } from '@/db/schema'
import { AddToCartPanel } from '@/components/product/AddToCartPanel'
import { ProductWishlistButton } from '@/components/product/ProductWishlistButton'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { ProductCard } from '@/components/product/ProductCard'
import { eq, desc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import { Reviews } from './Reviews'

export const dynamic = 'force-dynamic'

export default async function ProductDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const db = getDb()
  const { id } = await params
  const row = await db.select().from(products).where(eq(products.id, id)).limit(1)
  const product = row[0]
  if (!product) notFound()

  const images = product.images.length > 0 ? product.images : ['https://picsum.photos/seed/eunos-fallback/900/900']

  // Get related products
  const relatedProducts = await db
    .select()
    .from(products)
    .where(eq(products.category, product.category))
    .orderBy(desc(products.createdAt))
    .limit(4)

  // Get reviews
  let initialReviews: (typeof reviews.$inferSelect)[] = []
  try {
    initialReviews = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, id))
      .orderBy(desc(reviews.createdAt))
  } catch (_error) {
    // If DB hasn't been migrated yet, catch the error
  }

  return (
    <div className="space-y-12">
      {/* Breadcrumb */}
      <div className="text-sm text-muted">
        <Link href="/" className="hover:underline">
          Home
        </Link>
        {' / '}
        <Link href="/products" className="hover:underline">
          Products
        </Link>
        {' / '}
        <Link href={`/products?category=${product.category}`} className="hover:underline">
          {product.category.charAt(0).toUpperCase() + product.category.slice(1)}
        </Link>
        {' / '}
        <span className="text-brown">{product.name}</span>
      </div>

      {/* Product Details */}
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square overflow-hidden rounded-lg bg-beige">
            <Image src={images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-2">
            {images.slice(0, 4).map((src, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-lg bg-beige cursor-pointer hover:opacity-80">
                <Image src={src} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-6">
          {/* Category and Badges */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="secondary" className="uppercase text-xs">{product.category}</Badge>
            {product.isSale && <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">SALE</span>}
            {product.isNew && <span className="rounded-full bg-blue-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">NEW</span>}
            {product.isFeatured && <span className="rounded-full bg-brand-gold px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">FEATURED</span>}
          </div>

          {/* Title and Price */}
          <div>
            <h1 className="text-3xl font-bold text-brown">{product.name}</h1>
            <div className="mt-4 flex items-baseline gap-2">
              <div className="text-3xl font-bold text-brown">${product.price}</div>
              {product.isSale && <div className="text-lg text-muted line-through">${(parseFloat(product.price) * 1.2).toFixed(2)}</div>}
            </div>
          </div>

          {/* Description */}
          <div className="text-sm text-muted">{product.description}</div>

          {/* Color Options */}
          <div className="space-y-3">
            <div className="text-sm font-semibold text-brown">Color: Green</div>
            <div className="flex gap-3">
              {['Green', 'Orange', 'Blue'].map((color) => (
                <button
                  key={color}
                  className="rounded-md border-2 border-brown/20 bg-white px-4 py-2 text-sm font-medium text-brown hover:border-brown/50 transition"
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="pt-4 flex flex-col gap-4">
            <AddToCartPanel productId={product.id} max={product.stock} />
            <div>
              <ProductWishlistButton productId={product.id} productName={product.name} />
            </div>
          </div>

          {/* Shipping Info */}
          <div className="space-y-2 rounded-lg bg-beige/50 p-4">
            <div className="flex items-start gap-3 text-sm">
              <span className="text-lg">✓</span>
              <div>
                <div className="font-medium text-brown">In Stock - Ships within 2-3 business days</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-lg">✓</span>
              <div>
                <div className="font-medium text-brown">Free shipping on orders over $100</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-lg">✓</span>
              <div>
                <div className="font-medium text-brown">30-day return policy</div>
              </div>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <span className="text-lg">✓</span>
              <div>
                <div className="font-medium text-brown">Secure checkout</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features and Specifications */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Features */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brown">Features</h2>
          <ul className="space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Waterproof rainfly with 3000mm coating</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Aluminum poles for lightweight strength</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Two doors and vestibules for convenience</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Interior storage pockets</span>
            </li>
            <li className="flex gap-3">
              <span className="text-lg">✓</span>
              <span>Easy 10-minute setup</span>
            </li>
          </ul>
        </div>

        {/* Specifications */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-brown">Specifications</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-2 items-center text-sm border-b border-brown/10 pb-3">
              <span className="font-semibold text-brown">Capacity</span>
              <span className="text-muted">3 Person</span>
            </div>
            <div className="grid grid-cols-2 items-center text-sm border-b border-brown/10 pb-3">
              <span className="font-semibold text-brown">Weight</span>
              <span className="text-muted">5.2 lbs</span>
            </div>
            <div className="grid grid-cols-2 items-center text-sm border-b border-brown/10 pb-3">
              <span className="font-semibold text-brown">Floor Area</span>
              <span className="text-muted">42 sq ft</span>
            </div>
            <div className="grid grid-cols-2 items-center text-sm border-b border-brown/10 pb-3">
              <span className="font-semibold text-brown">Peak Height</span>
              <span className="text-muted">52 inches</span>
            </div>
            <div className="grid grid-cols-2 items-center text-sm">
              <span className="font-semibold text-brown">Season</span>
              <span className="text-muted">3-Season</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <Reviews productId={id} initialReviews={initialReviews} />

      {/* You May Also Like */}
      <section>
        <h2 className="text-2xl font-bold text-brown">You may also like</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {relatedProducts.slice(0, 4).map((p) => (
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
    </div>
  )
}
