'use client'

import { useSession } from 'next-auth/react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'

export function AddToCartPanel({
  productId,
  max,
}: {
  productId: string
  max: number
}) {
  const { data: session } = useSession()
  const { hydrate, hydrated, addGuestItem } = useCart()
  const [qty, setQty] = React.useState(1)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  async function add() {
    if (busy) return
    setBusy(true)
    try {
      const quantity = Math.max(1, Math.min(max, qty))
      if (session?.user?.id) {
        const res = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ productId, quantity }),
        })
        if (!res.ok) throw new Error('add_failed')
      } else {
        addGuestItem(productId, quantity)
      }
      toast.success(`Added ${quantity} item(s) to cart`)
    } catch (err) {
      toast.error('Failed to add item to cart')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="text-sm text-muted">Quantity</div>
        <Input
          className="w-24"
          type="number"
          min={1}
          max={max}
          value={qty}
          onChange={(e) => setQty(parseInt(e.target.value || '1', 10) || 1)}
        />
      </div>
      <Button className="w-full" disabled={busy || max <= 0} onClick={add}>
        {max <= 0 ? 'Out of stock' : busy ? 'Adding…' : 'Add to Cart'}
      </Button>
    </div>
  )
}

