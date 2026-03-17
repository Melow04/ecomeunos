'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = React.useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirm: '',
    terms: false,
  })
  const [busy, setBusy] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      if (form.password !== form.confirm) {
        setError('Passwords do not match')
        return
      }
      if (!form.terms) {
        setError('Please accept the terms')
        return
      }

      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
        }),
      })

      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setError(data?.error ?? 'Registration failed')
        return
      }

      await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      router.push('/account')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader className="p-6">
          <CardTitle className="text-lg">Welcome to EUNOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 p-6 pt-0">
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input placeholder="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
              <Input placeholder="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
            </div>
            <Input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <Input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <Input placeholder="Confirm password" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
            <label className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" checked={form.terms} onChange={(e) => setForm({ ...form, terms: e.target.checked })} />
              I agree to the Terms
            </label>
            {error ? <div className="text-sm text-red-700">{error}</div> : null}
            <Button className="w-full" disabled={busy} type="submit">
              {busy ? 'Creating…' : 'Create Account'}
            </Button>
          </form>
          <div className="text-sm text-muted">
            Already have an account?{' '}
            <Link className="text-primary hover:underline" href="/auth/login">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

