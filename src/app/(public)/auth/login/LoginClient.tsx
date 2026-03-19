'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/hooks/useCart'

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/'

  const { hydrate, hydrated, guestItems, clearGuest } = useCart()

  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [show, setShow] = React.useState(false)
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!hydrated) hydrate()
  }, [hydrated, hydrate])

  async function mergeGuestCart() {
    if (guestItems.length === 0) return
    for (const item of guestItems) {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: item.productId, quantity: item.quantity }),
      })
    }
    clearGuest()
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })
      if (!res || res.error) {
        setError('Invalid email or password')
        return
      }
      await mergeGuestCart()
      router.push(next)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="p-6">
          <CardTitle className="text-lg">Welcome Back</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <div className="text-xs font-semibold text-brown">Email</div>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="text-xs font-semibold text-brown">Password</div>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? 'Hide' : 'Show'}
                </button>
              </div>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type={show ? 'text' : 'password'}
                required
              />
            </div>
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" /> Remember me
            </label>
            {error ? <div className="text-sm text-red-700">{error}</div> : null}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Signing in…' : 'Sign In'}
            </Button>
          </form>
          <div className="text-sm text-muted">
            New here?{' '}
            <Link className="text-primary hover:underline" href={`/auth/register?next=${encodeURIComponent(next)}`}>
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

