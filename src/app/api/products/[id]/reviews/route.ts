import { NextResponse } from 'next/server'
import { getDb } from '@/db'
import { reviews } from '@/db/schema'
import { desc, eq } from 'drizzle-orm'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const { id } = await params
  
  try {
    const list = await db
      .select()
      .from(reviews)
      .where(eq(reviews.productId, id))
      .orderBy(desc(reviews.createdAt))
      
    return NextResponse.json({ reviews: list })
  } catch (error) {
    // If table doesn't exist yet, return empty list
    return NextResponse.json({ reviews: [] })
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb()
  const { id } = await params
  
  try {
    const body = await req.json()
    const { author, rating, comment } = body
    
    if (!author || !comment || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const [review] = await db.insert(reviews).values({
      productId: id,
      author,
      rating: Number(rating),
      comment,
    }).returning()
    
    return NextResponse.json({ review })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to add review' }, { status: 500 })
  }
}
