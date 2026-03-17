import { NextResponse } from 'next/server'

import { getDb } from '@/db'
import { products } from '@/db/schema'
import { eq } from 'drizzle-orm'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const { id } = await params
  const row = await db.select().from(products).where(eq(products.id, id)).limit(1)
  const product = row[0]
  if (!product) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ product })
}
