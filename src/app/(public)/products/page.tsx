import { getDb } from '@/db'
import { products } from '@/db/schema'
import { FilterSidebar } from '@/components/product/FilterSidebar'
import { ProductCard, type ProductForCard } from '@/components/product/ProductCard'
import { and, or, asc, desc, gte, inArray, lte, sql, ilike } from 'drizzle-orm'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

type Category = 'camping' | 'hiking' | 'clothing' | 'footwear'

function isCategory(v: string): v is Category {
  return v === 'camping' || v === 'hiking' || v === 'clothing' || v === 'footwear'
}

function toParams(sp: Record<string, string | string[] | undefined>) {
  const p = new URLSearchParams()
  Object.entries(sp).forEach(([k, v]) => {
    if (typeof v === 'string' && v.trim()) p.set(k, v)
    if (Array.isArray(v)) v.forEach((x) => p.append(k, x))
  })
  return p
}

function parseNumber(value: string | null) {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const db = getDb()
  const sp = await searchParams
  const categoryParam = typeof sp.category === 'string' ? sp.category : ''
  const categories = categoryParam
    ? categoryParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter(isCategory)
    : []

  const minPrice = parseNumber(typeof sp.minPrice === 'string' ? sp.minPrice : null)
  const maxPrice = parseNumber(typeof sp.maxPrice === 'string' ? sp.maxPrice : null)
  const sort = typeof sp.sort === 'string' ? sp.sort : 'newest'
  const page = Math.max(1, parseInt(typeof sp.page === 'string' ? sp.page : '1', 10) || 1)
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''
  const qWords = q.split(/\s+/).filter(Boolean)
  const pageSize = 12
  const offset = (page - 1) * pageSize

  const where = and(
    categories.length > 0 ? inArray(products.category, categories) : undefined,
    minPrice !== null ? gte(products.price, String(minPrice.toFixed(2))) : undefined,
    maxPrice !== null ? lte(products.price, String(maxPrice.toFixed(2))) : undefined,
    qWords.length > 0 ? and(...qWords.map(word => 
      or(
        ilike(products.name, `%${word}%`),
        ilike(products.description, `%${word}%`),
        ilike(products.category, `%${word}%`)
      )
    )) : undefined
  )

  const orderBy =
    sort === 'price-asc'
      ? asc(products.price)
      : sort === 'price-desc'
        ? desc(products.price)
        : desc(products.createdAt)

  const [items, totalCountRows] = await Promise.all([
    db.select().from(products).where(where).orderBy(orderBy).limit(pageSize).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(products).where(where),
  ])

  const total = Number(totalCountRows[0]?.count ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const sortParam = sort
  const baseParams = toParams(sp)

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid gap-12 md:grid-cols-[280px_1fr]">
        <FilterSidebar />
        <div>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-4xl font-black text-black tracking-tight">Outdoor Equipment</h1>
              <div className="mt-2 text-sm font-medium text-black/60">Showing {total} products</div>
            </div>
            <div className="flex items-center gap-3 text-sm font-semibold">
              <span className="text-black/60">Sort by:</span>
              <div className="flex gap-2">
                <Link
                  className={
                    sortParam === 'newest'
                      ? 'rounded-md bg-black text-white px-3 py-1.5'
                      : 'rounded-md px-3 py-1.5 text-black border border-black/10 hover:bg-black/5'
                  }
                  href={`/products?${(() => {
                    const p = new URLSearchParams(baseParams)
                    p.set('sort', 'newest')
                    p.set('page', '1')
                    return p.toString()
                  })()}`}
                >
                  Newest
                </Link>
                <Link
                  className={
                    sortParam === 'price-asc'
                      ? 'rounded-md bg-black text-white px-3 py-1.5'
                      : 'rounded-md px-3 py-1.5 text-black border border-black/10 hover:bg-black/5'
                  }
                  href={`/products?${(() => {
                    const p = new URLSearchParams(baseParams)
                    p.set('sort', 'price-asc')
                    p.set('page', '1')
                    return p.toString()
                  })()}`}
                >
                  Lowest Price
                </Link>
                <Link
                  className={
                    sortParam === 'price-desc'
                      ? 'rounded-md bg-black text-white px-3 py-1.5'
                      : 'rounded-md px-3 py-1.5 text-black border border-black/10 hover:bg-black/5'
                  }
                  href={`/products?${(() => {
                    const p = new URLSearchParams(baseParams)
                    p.set('sort', 'price-desc')
                    p.set('page', '1')
                    return p.toString()
                  })()}`}
                >
                  Highest Price
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((p) => (
              <ProductCard key={p.id} product={p as unknown as ProductForCard} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-between border-t border-black/10 pt-6 text-sm font-bold">
              <div className="text-black/60">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Link
                  className={
                    page <= 1
                      ? 'pointer-events-none rounded-md px-4 py-2 border border-black/10 text-black/40'
                      : 'rounded-md px-4 py-2 border border-black/20 text-black hover:bg-black/5 transition'
                  }
                  href={`/products?${(() => {
                    const p = new URLSearchParams(baseParams)
                    p.set('page', String(Math.max(1, page - 1)))
                    return p.toString()
                  })()}`}
                >
                  Previous
                </Link>
                <Link
                  className={
                    page >= totalPages
                      ? 'pointer-events-none rounded-md px-4 py-2 border border-black/10 text-black/40'
                      : 'rounded-md px-4 py-2 border border-black/20 text-black hover:bg-black/5 transition'
                  }
                  href={`/products?${(() => {
                    const p = new URLSearchParams(baseParams)
                    p.set('page', String(Math.min(totalPages, page + 1)))
                    return p.toString()
                  })()}`}
                >
                  Next
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

