'use client'

import { useSession } from 'next-auth/react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useWishlist } from '@/hooks/useWishlist'

export function ProductWishlistButton({ productId, productName }: { productId: string; productName: string }) {
  const { data: session } = useSession()
  const { items: wishlistItems, toggleWishlist } = useWishlist()

  const isWishlisted = wishlistItems.includes(productId)

  async function handleWishlist(e: React.MouseEvent) {
    e.preventDefault()
    if (!session?.user?.id) {
      toast.error('Please log in to use the wishlist')
      return
    }
    await toggleWishlist(productId)
    if (isWishlisted) {
      toast.success(`${productName} removed from wishlist`)
    } else {
      toast.success(`${productName} added to wishlist`)
    }
  }

  return (
    <button 
      onClick={handleWishlist}
      className={`flex items-center gap-2 rounded-md border-2 border-brown/20 bg-white px-4 py-2 text-sm font-medium transition hover:border-brown/50 ${isWishlisted ? 'text-red-500' : 'text-brown'}`}
    >
      <Heart className="h-4 w-4" fill={isWishlisted ? 'currentColor' : 'none'} />
      {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
    </button>
  )
}
