import { NextResponse } from 'next/server'
import { z } from 'zod'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { requireAdmin } from '@/lib/server-auth'
import { eq } from 'drizzle-orm'

const patchSchema = z
  .object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).optional(),
    price: z.number().min(0).optional(),
    category: z.enum(['camping', 'hiking', 'clothing', 'footwear']).optional(),
    stock: z.number().int().min(0).optional(),
    images: z.array(z.string().url()).optional(),
    status: z.enum(['active', 'low-stock', 'out-of-stock']).optional(),
  })
  .refine((v) => Object.keys(v).length > 0)

function statusFromStock(stock: number): 'active' | 'low-stock' | 'out-of-stock' {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  return 'active'
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const json = await req.json().catch(() => null)
  const parsed = patchSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const update: Partial<typeof products.$inferInsert> = {}
  if (parsed.data.name !== undefined) update.name = parsed.data.name
  if (parsed.data.description !== undefined) update.description = parsed.data.description
  if (parsed.data.price !== undefined) update.price = parsed.data.price.toFixed(2)
  if (parsed.data.category !== undefined) update.category = parsed.data.category
  if (parsed.data.images !== undefined) update.images = parsed.data.images

  if (parsed.data.stock !== undefined) {
    update.stock = parsed.data.stock
    update.status = statusFromStock(parsed.data.stock)
  } else if (parsed.data.status !== undefined) {
    update.status = parsed.data.status
  }

  const updated = await db.update(products).set(update).where(eq(products.id, id)).returning()
  if (updated.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json({ product: updated[0] })
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const session = await requireAdmin()
  if (!session) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { id } = await params

  const deleted = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id })
  if (deleted.length === 0) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
