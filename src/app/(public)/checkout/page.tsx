import { Suspense } from 'react'

import CheckoutClient from './CheckoutClient'

export const dynamic = 'force-dynamic'

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="text-sm text-muted">Loading…</div>}>
      <CheckoutClient />
    </Suspense>
  )
}
