'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'

type Product = {
  id: string
  name: string
  price: string
  images: string[]
  stock: number
}

type UserCartItem = {
  id: string
  quantity: number
  product: Product
}

type LineItem = {
  key: string
  name: string
  price: number
  quantity: number
  max: number
  onQuantity: (q: number) => Promise<void>
  onRemove: () => Promise<void>
}

function isLineItem(v: LineItem | null): v is LineItem {
  return v !== null
}

function money(n: number) {
  return n.toFixed(2)
}

export default function CartPage() {
  const { data: session, status } = useSession()
  const { hydrated, hydrate, guestItems, setGuestQuantity, removeGuestItem } = useCart()

  const [userItems, setUserItems] = React.useState<UserCartItem[]>([])
  const [guestProducts, setGuestProducts] = React.useState<Record<string, Product>>({})
  const [loading, setLoading] = React.useState(false)

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  React.useEffect(() => {
    if (status !== 'authenticated') return
    setLoading(true)
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => setUserItems(data.items ?? []))
      .finally(() => setLoading(false))
  }, [status])

  React.useEffect(() => {
    if (session?.user?.id) return
    const missing = guestItems
      .map((i) => i.productId)
      .filter((id) => !guestProducts[id])
    if (missing.length === 0) return

    Promise.all(
      missing.map((id) =>
        fetch(`/api/products/${id}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => data?.product as Product | undefined)
      )
    ).then((rows) => {
      const next = { ...guestProducts }
      rows.filter(Boolean).forEach((p) => {
        next[(p as Product).id] = p as Product
      })
      setGuestProducts(next)
    })
  }, [guestItems, guestProducts, session?.user?.id])

  const lineItems: LineItem[] = session?.user?.id
    ? userItems.map((i) => ({
        key: i.id,
        name: i.product.name,
        price: Number(i.product.price),
        quantity: i.quantity,
        max: i.product.stock,
        onQuantity: async (q: number) => {
          await fetch(`/api/cart/${i.id}`, {
            method: 'PATCH',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ quantity: q }),
          })
          setUserItems((prev) => prev.map((x) => (x.id === i.id ? { ...x, quantity: q } : x)))
        },
        onRemove: async () => {
          await fetch(`/api/cart/${i.id}`, { method: 'DELETE' })
          setUserItems((prev) => prev.filter((x) => x.id !== i.id))
        },
      }))
    : guestItems
        .map((i) => {
          const p = guestProducts[i.productId]
          if (!p) return null
          return {
            key: i.productId,
            name: p.name,
            price: Number(p.price),
            quantity: i.quantity,
            max: p.stock,
            onQuantity: async (q: number) => setGuestQuantity(i.productId, q),
            onRemove: async () => removeGuestItem(i.productId),
          } satisfies LineItem
        })
        .filter(isLineItem)

  const subtotal = lineItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = lineItems.length > 0 ? 9.99 : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div>
        <h1 className="text-xl font-semibold text-brown">Shopping Cart</h1>
        <div className="mt-4 space-y-3">
          {loading ? (
            <Card className="p-6 text-sm text-muted">Loading your cart…</Card>
          ) : lineItems.length === 0 ? (
            <Card className="p-6 text-sm text-muted">
              Your cart is empty.{' '}
              <Link className="text-primary hover:underline" href="/products">
                Continue shopping
              </Link>
              .
            </Card>
          ) : (
            lineItems.map((i) => (
              <Card key={i.key} className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="line-clamp-1 text-sm font-semibold text-brown">{i.name}</div>
                    <div className="mt-1 text-xs text-muted">${money(i.price)} each</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Input
                      className="w-24"
                      type="number"
                      min={1}
                      max={i.max}
                      value={i.quantity}
                      onChange={(e) => i.onQuantity(parseInt(e.target.value || '1', 10) || 1)}
                    />
                    <div className="w-24 text-right text-sm font-semibold text-brown">
                      ${money(i.price * i.quantity)}
                    </div>
                    <Button variant="ghost" onClick={i.onRemove}>
                      Remove
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
        <div className="mt-4 flex gap-3">
          <Button asChild variant="secondary">
            <Link href="/products">Continue Shopping</Link>
          </Button>
          <Button asChild disabled={lineItems.length === 0}>
            <Link href="/checkout?step=1">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>

      <Card className="h-fit">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 p-4 pt-0 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span className="font-semibold text-brown">${money(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span className="font-semibold text-brown">${money(shipping)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Tax (8%)</span>
            <span className="font-semibold text-brown">${money(tax)}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-brown/10 pt-3">
            <span className="text-brown">Total</span>
            <span className="text-base font-semibold text-brown">${money(total)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
