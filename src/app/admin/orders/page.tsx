'use client'

import * as React from 'react'

import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

type Row = {
  order: {
    id: string
    total: string
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
    createdAt: string
  }
  customerEmail: string | null
  shippingEmail: string | null
  shippingFirstName: string | null
  shippingLastName: string | null
}

function statusVariant(status: Row['order']['status']): BadgeVariant {
  if (status === 'pending') return 'yellow'
  if (status === 'processing') return 'blue'
  if (status === 'shipped') return 'blue'
  if (status === 'delivered') return 'green'
  return 'red'
}

export default function AdminOrdersPage() {
  const [items, setItems] = React.useState<Row[]>([])
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    setLoading(true)
    fetch('/api/admin/orders')
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .finally(() => setLoading(false))
  }, [])

  async function updateStatus(id: string, status: Row['order']['status']) {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (!res.ok) return
    setItems((prev) =>
      prev.map((r) => (r.order.id === id ? { ...r, order: { ...r.order, status } } : r))
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brown">Order Management</h1>
        <div className="mt-1 text-sm text-muted">Update fulfillment status</div>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2">Order ID</th>
                  <th className="py-2">Customer</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.order.id} className="border-t border-brown/10">
                    <td className="py-3 font-medium text-brown">{r.order.id}</td>
                    <td className="py-3 text-brown/80">
                      {r.customerEmail ?? r.shippingEmail ?? 'Guest'}
                    </td>
                    <td className="py-3 text-brown">${r.order.total}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={statusVariant(r.order.status)}>{r.order.status}</Badge>
                        <select
                          className="h-9 rounded-md border border-brown/10 bg-white px-2 text-sm"
                          value={r.order.status}
                          onChange={(e) => updateStatus(r.order.id, e.target.value as Row['order']['status'])}
                        >
                          <option value="pending">pending</option>
                          <option value="processing">processing</option>
                          <option value="shipped">shipped</option>
                          <option value="delivered">delivered</option>
                          <option value="cancelled">cancelled</option>
                        </select>
                      </div>
                    </td>
                    <td className="py-3 text-muted">{new Date(r.order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
