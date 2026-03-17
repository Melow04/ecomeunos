import Image from 'next/image'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { AddToCartPanel } from '@/components/product/AddToCartPanel'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { eq } from 'drizzle-orm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

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

  return (
    <div className="space-y-8">
      <div className="text-sm text-muted">
        <Link href="/products" className="hover:underline">
          Products
        </Link>{' '}
        / <span className="text-brown">{product.name}</span>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="relative aspect-square bg-beige">
            <Image src={images[0]} alt={product.name} fill className="object-cover" />
          </div>
          <div className="grid grid-cols-4 gap-2 p-3">
            {images.slice(0, 4).map((src, idx) => (
              <div key={idx} className="relative aspect-square overflow-hidden rounded-md bg-beige">
                <Image src={src} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
              </div>
            ))}
          </div>
        </Card>

        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{product.category}</Badge>
            {product.status === 'low-stock' ? <Badge variant="gold">Low stock</Badge> : null}
            {product.status === 'out-of-stock' ? <Badge variant="red">Out of stock</Badge> : null}
          </div>
          <h1 className="mt-3 text-2xl font-semibold text-brown">{product.name}</h1>
          <div className="mt-2 text-xl font-semibold text-brown">${product.price}</div>

          <div className="mt-4 text-sm text-muted">{product.description}</div>

          <div className="mt-6">
            <AddToCartPanel productId={product.id} max={product.stock} />
          </div>

          <div className="mt-8 grid gap-3 rounded-xl border border-brown/10 bg-white p-5 text-sm">
            <div className="font-semibold text-brown">Features</div>
            <ul className="list-disc pl-5 text-muted">
              <li>Trail-tested materials with eco-conscious sourcing</li>
              <li>Designed for comfort and durability</li>
              <li>Fast shipping options at checkout</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
