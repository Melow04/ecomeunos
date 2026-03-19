'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import * as React from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'

type Product = {
  id: string
  name: string
  price: string
  stock: number
}

type GuestLine = { productId: string; quantity: number; product: Product }
type UserCartItem = { id: string; quantity: number; product: Product }

type CheckoutPayload = {
  step1: {
    firstName: string
    lastName: string
    email: string
    phone: string
    street: string
    city: string
    state: string
    zip: string
  }
  shippingMethod: 'standard' | 'express' | 'overnight'
  paymentMethod: 'card' | 'ewallet' | 'cod'
  card?: {
    number: string
    holder: string
    expiry: string
    cvv: string
  }
  items?: Array<{ productId: string; quantity: number }>
}

function money(n: number) {
  return n.toFixed(2)
}

export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const step = Math.min(3, Math.max(1, parseInt(searchParams.get('step') ?? '1', 10) || 1))

  const { data: session, status } = useSession()
  const { hydrated, hydrate, guestItems, clearGuest, removeGuestItem } = useCart()

  const selectedItemsParam = searchParams.get('items')
  const selectedProductIds = React.useMemo(() => {
    if (!selectedItemsParam) return null
    return new Set(selectedItemsParam.split(',').filter(Boolean))
  }, [selectedItemsParam])

  const [guestLines, setGuestLines] = React.useState<GuestLine[]>([])
  const [userCartItems, setUserCartItems] = React.useState<UserCartItem[]>([])
  const [shippingMethod, setShippingMethod] = React.useState<'standard' | 'express' | 'overnight'>('standard')
  const [paymentMethod, setPaymentMethod] = React.useState<'card' | 'ewallet' | 'cod'>('card')
  const [saveInfo, setSaveInfo] = React.useState(true)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    cardHolder: '',
    cardExpiry: '',
    cardCvv: '',
  })

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  React.useEffect(() => {
    if (status === 'authenticated') {
      const saved = window.localStorage.getItem(`eunos_saved_info_${session?.user?.id}`)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          setForm((f) => ({ ...f, ...parsed, email: session?.user?.email ?? parsed.email ?? f.email }))
        } catch {
          setForm((f) => ({ ...f, email: session?.user?.email ?? f.email }))
        }
      } else {
        setForm((f) => ({ ...f, email: session?.user?.email ?? f.email }))
      }
    }
  }, [status, session?.user?.id, session?.user?.email])

  React.useEffect(() => {
    if (status !== 'authenticated') return
    fetch('/api/cart')
      .then((r) => r.json())
      .then((data) => setUserCartItems(data.items ?? []))
  }, [status])

  React.useEffect(() => {
    if (session?.user?.id) return
    if (!hydrated) return
    if (guestItems.length === 0) return

    Promise.all(
      guestItems.map((i) =>
        fetch(`/api/products/${i.productId}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((data) => data?.product as Product | undefined)
          .then((p) => (p ? ({ productId: i.productId, quantity: i.quantity, product: p } as GuestLine) : null))
      )
    ).then((rows) => setGuestLines(rows.filter(Boolean) as GuestLine[]))
  }, [guestItems, hydrated, session?.user?.id])

  const subtotal = session?.user?.id
    ? userCartItems.filter(i => !selectedProductIds || selectedProductIds.has(i.product.id)).reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0)
    : guestLines.filter(l => !selectedProductIds || selectedProductIds.has(l.productId)).reduce((sum, l) => sum + Number(l.product.price) * l.quantity, 0)
  const shippingCost = shippingMethod === 'standard' ? 9.99 : shippingMethod === 'express' ? 19.99 : 39.99
  const tax = subtotal * 0.08
  const hasItems = session?.user?.id 
    ? userCartItems.filter(i => !selectedProductIds || selectedProductIds.has(i.product.id)).length > 0 
    : guestLines.filter(l => !selectedProductIds || selectedProductIds.has(l.productId)).length > 0
  const total = subtotal + (hasItems ? shippingCost : 0) + tax

  function goTo(nextStep: number) {
    router.push(`/checkout?step=${nextStep}`)
  }

  async function placeOrder() {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      if (!hasItems) {
        setError('Cart is empty')
        return
      }

      const missingShipping =
        !form.firstName.trim() ||
        !form.lastName.trim() ||
        !form.email.trim() ||
        !form.phone.trim() ||
        !form.street.trim() ||
        !form.city.trim() ||
        !form.state.trim() ||
        !form.zip.trim()

      if (missingShipping) {
        setError('Please complete your contact and shipping information.')
        goTo(1)
        return
      }

      if (
        paymentMethod === 'card' &&
        (!form.cardNumber.trim() || !form.cardHolder.trim() || !form.cardExpiry.trim() || !form.cardCvv.trim())
      ) {
        setError('Please complete your card details.')
        return
      }

      const payload: CheckoutPayload = {
        step1: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone,
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
        },
        shippingMethod,
        paymentMethod,
      }

      if (paymentMethod === 'card') {
        payload.card = {
          number: form.cardNumber,
          holder: form.cardHolder,
          expiry: form.cardExpiry,
          cvv: form.cardCvv,
        }
      }

      if (!session?.user?.id) {
        payload.items = guestLines.filter(l => !selectedProductIds || selectedProductIds.has(l.productId)).map((l) => ({ productId: l.productId, quantity: l.quantity }))
      } else {
        if (selectedProductIds) {
          payload.items = userCartItems.filter(i => selectedProductIds.has(i.product.id)).map(i => ({ productId: i.product.id, quantity: i.quantity }))
        }
      }

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Order failed')
        if ((data?.error ?? '') === 'Invalid payload') goTo(1)
        toast.error('Failed to submit order')
        return
      }

      const orderId = data?.id as string | undefined
      if (!orderId) {
        setError('Order created but response was missing an id.')
        toast.error('Order creation failed on the server')
        return
      }

      if (!session?.user?.id) {
        if (selectedProductIds) {
          payload.items?.forEach(i => removeGuestItem(i.productId))
        } else {
          clearGuest()
        }
      }
      else if (saveInfo) {
        window.localStorage.setItem(`eunos_saved_info_${session.user.id}`, JSON.stringify({
          firstName: payload.step1.firstName,
          lastName: payload.step1.lastName,
          email: payload.step1.email,
          phone: payload.step1.phone,
          street: payload.step1.street,
          city: payload.step1.city,
          state: payload.step1.state,
          zip: payload.step1.zip,
        }))
      }
      toast.success('Order placed successfully!')
      router.push(`/order-confirmation/${orderId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed')
      toast.error('An unexpected error occurred')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <h1 className="text-xl font-semibold text-brown">Checkout</h1>

        <Card>
          <CardHeader className="p-4">
            <CardTitle className="text-sm">Step {step} of 3</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 pt-0">
            <div className="flex gap-2">
              <Button variant={step === 1 ? 'default' : 'secondary'} onClick={() => goTo(1)}>
                Information
              </Button>
              <Button variant={step === 2 ? 'default' : 'secondary'} onClick={() => goTo(2)}>
                Shipping
              </Button>
              <Button variant={step === 3 ? 'default' : 'secondary'} onClick={() => goTo(3)}>
                Payment
              </Button>
            </div>

            {error ? <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</div> : null}

            {step === 1 ? (
              <div className="grid gap-3 md:grid-cols-2">
                <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
                <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
                <Input className="md:col-span-2" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                <Input className="md:col-span-2" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <Input className="md:col-span-2" placeholder="Street" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
                <Input placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                <Input placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                <Input placeholder="ZIP" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                {status === 'authenticated' && (
                  <div className="md:col-span-2 flex items-center gap-2 mt-2">
                    <input type="checkbox" id="saveInfo" checked={saveInfo} onChange={(e) => setSaveInfo(e.target.checked)} className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4" />
                    <label htmlFor="saveInfo" className="text-sm text-brown">Save this information for next time</label>
                  </div>
                )}
                <div className="md:col-span-2 flex justify-end">
                  <Button onClick={() => goTo(2)}>Continue</Button>
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-3">
                <label className="flex items-center justify-between rounded-md border border-brown/10 bg-white p-3">
                  <div>
                    <div className="text-sm font-semibold text-brown">Standard</div>
                    <div className="text-xs text-muted">$9.99 • 5–7 days</div>
                  </div>
                  <input type="radio" checked={shippingMethod === 'standard'} onChange={() => setShippingMethod('standard')} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-brown/10 bg-white p-3">
                  <div>
                    <div className="text-sm font-semibold text-brown">Express</div>
                    <div className="text-xs text-muted">$19.99 • 2–3 days</div>
                  </div>
                  <input type="radio" checked={shippingMethod === 'express'} onChange={() => setShippingMethod('express')} />
                </label>
                <label className="flex items-center justify-between rounded-md border border-brown/10 bg-white p-3">
                  <div>
                    <div className="text-sm font-semibold text-brown">Overnight</div>
                    <div className="text-xs text-muted">$39.99 • next day</div>
                  </div>
                  <input type="radio" checked={shippingMethod === 'overnight'} onChange={() => setShippingMethod('overnight')} />
                </label>
                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => goTo(1)}>
                    Back
                  </Button>
                  <Button onClick={() => goTo(3)}>Continue</Button>
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label className="flex items-center justify-between rounded-md border border-brown/10 bg-white p-3">
                    <div className="text-sm font-semibold text-brown">Credit Card</div>
                    <input type="radio" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} />
                  </label>
                  <label className="flex items-center justify-between rounded-md border border-brown/10 bg-white p-3">
                    <div className="text-sm font-semibold text-brown">E‑Wallet</div>
                    <input type="radio" checked={paymentMethod === 'ewallet'} onChange={() => setPaymentMethod('ewallet')} />
                  </label>
                  <label className="flex items-center justify-between rounded-md border border-brown/10 bg-white p-3">
                    <div className="text-sm font-semibold text-brown">Cash on Delivery</div>
                    <input type="radio" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                  </label>
                </div>

                {paymentMethod === 'card' ? (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input className="md:col-span-2" placeholder="Card number" value={form.cardNumber} onChange={(e) => setForm({ ...form, cardNumber: e.target.value })} />
                    <Input className="md:col-span-2" placeholder="Card holder" value={form.cardHolder} onChange={(e) => setForm({ ...form, cardHolder: e.target.value })} />
                    <Input placeholder="Expiry (MM/YY)" value={form.cardExpiry} onChange={(e) => setForm({ ...form, cardExpiry: e.target.value })} />
                    <Input placeholder="CVV" value={form.cardCvv} onChange={(e) => setForm({ ...form, cardCvv: e.target.value })} />
                  </div>
                ) : null}

                <div className="flex justify-end gap-2">
                  <Button variant="secondary" onClick={() => goTo(2)}>
                    Back
                  </Button>
                  <Button onClick={placeOrder} disabled={busy}>
                    {busy ? 'Placing…' : 'Place Order'}
                  </Button>
                </div>
                <div className="text-xs text-muted">Payment is fully simulated and always succeeds.</div>
              </div>
            ) : null}
          </CardContent>
        </Card>
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
            <span className="font-semibold text-brown">${money(hasItems ? shippingCost : 0)}</span>
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
