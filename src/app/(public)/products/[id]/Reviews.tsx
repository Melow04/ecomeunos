'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Star } from 'lucide-react'
import { useRouter } from 'next/navigation'

type Review = {
  id: string
  author: string
  rating: number
  comment: string
  createdAt: Date | string
}

export function Reviews({ productId, initialReviews }: { productId: string, initialReviews: Review[] }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews)
  const [author, setAuthor] = useState('')
  const [comment, setComment] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!author.trim() || !comment.trim()) return

    setSubmitting(true)
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, comment, rating }),
      })
      if (res.ok) {
        const { review } = await res.json()
        setReviews([review, ...reviews])
        setAuthor('')
        setComment('')
        setRating(5)
        router.refresh()
      } else {
        alert('Failed to submit review')
      }
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-8 mt-12">
      <h2 className="text-2xl font-bold text-brown">Customer Reviews</h2>
      
      <Card className="p-6 bg-beige/30">
        <h3 className="text-lg font-semibold mb-4 text-brown">Write a Review</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/70">Name</label>
              <Input 
                value={author} 
                onChange={(e) => setAuthor(e.target.value)} 
                placeholder="John Doe" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-black/70">Rating</label>
              <div className="flex gap-1 h-10 items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className={`focus:outline-none ${star <= rating ? 'text-brand-gold' : 'text-black/20'}`}
                  >
                    <Star className="w-6 h-6 fill-current" />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-black/70">Comment</label>
            <textarea 
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you think about this product?"
              required
            />
          </div>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </form>
      </Card>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted">No reviews yet. Be the first to review this product!</p>
        ) : (
          reviews.map((r) => (
            <Card key={r.id} className="p-4 bg-white">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-brown">{r.author}</h4>
                  <div className="flex gap-1 mt-1 text-brand-gold">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-current' : 'text-black/20'}`} />
                    ))}
                  </div>
                </div>
                <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-black/80">{r.comment}</p>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
