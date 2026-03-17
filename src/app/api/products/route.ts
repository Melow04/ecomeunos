import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { and, asc, desc, gte, inArray, lte, sql } from 'drizzle-orm'

type Category = 'camping' | 'hiking' | 'clothing' | 'footwear'

function isCategory(v: string): v is Category {
  return v === 'camping' || v === 'hiking' || v === 'clothing' || v === 'footwear'
}

function parseNumber(value: string | null) {
  if (!value) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

export async function GET(req: Request) {
  const db = getDb()
  const url = new URL(req.url)

  const categoryParam = url.searchParams.get('category')
  const categories = categoryParam
    ? categoryParam
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .filter(isCategory)
    : []

  const minPrice = parseNumber(url.searchParams.get('minPrice'))
  const maxPrice = parseNumber(url.searchParams.get('maxPrice'))
  const sort = url.searchParams.get('sort') ?? 'newest'
  const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1', 10) || 1)
  const pageSize = 12
  const offset = (page - 1) * pageSize

  const where = and(
    categories.length > 0 ? inArray(products.category, categories) : undefined,
    minPrice !== null ? gte(products.price, String(minPrice.toFixed(2))) : undefined,
    maxPrice !== null ? lte(products.price, String(maxPrice.toFixed(2))) : undefined
  )

  const orderBy =
    sort === 'price-asc'
      ? asc(products.price)
      : sort === 'price-desc'
        ? desc(products.price)
        : desc(products.createdAt)

  const [items, totalCountRows] = await Promise.all([
    db
      .select()
      .from(products)
      .where(where)
      .orderBy(orderBy)
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(where),
  ])

  const total = Number(totalCountRows[0]?.count ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return NextResponse.json({ items, page, pageSize, total, totalPages })
}
