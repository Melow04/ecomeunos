import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { requireAdmin } from '@/lib/server-auth'
import { desc, ilike } from 'drizzle-orm'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(1),
  price: z.number().min(0),
  category: z.enum(['camping', 'hiking', 'clothing', 'footwear']),
  stock: z.number().int().min(0),
  images: z.array(z.string().url()).default([]),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isSale: z.boolean().default(false),
})

function statusFromStock(stock: number): 'active' | 'low-stock' | 'out-of-stock' {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  return 'active'
}

export async function GET(req: Request) {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').trim()

  const rows = await db
    .select()
    .from(products)
    .where(q ? ilike(products.name, `%${q}%`) : undefined)
    .orderBy(desc(products.createdAt))
    .limit(200)

  return NextResponse.json({ items: rows })
}

export async function POST(req: Request) {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const json = await req.json().catch(() => null)
  const parsed = createSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const created = await db
    .insert(products)
    .values({
      name: parsed.data.name,
      description: parsed.data.description,
      price: parsed.data.price.toFixed(2),
      category: parsed.data.category,
      stock: parsed.data.stock,
      status: statusFromStock(parsed.data.stock),
      images: parsed.data.images,
      isFeatured: parsed.data.isFeatured,
      isNew: parsed.data.isNew,
      isSale: parsed.data.isSale,
    })
    .returning()

  return NextResponse.json({ product: created[0] }, { status: 201 })
}
