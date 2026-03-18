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

function getStatusColor(status: Row['order']['status']) {
  if (status === 'pending') return 'bg-yellow-100 text-yellow-800'
  if (status === 'processing' || status === 'shipped') return 'bg-blue-100 text-blue-800'
  if (status === 'delivered') return 'bg-green-100 text-green-800'
  return 'bg-red-100 text-red-800'
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
        <h1 className="text-2xl font-bold text-brown">Order Management</h1>
        <p className="mt-1 text-sm text-muted">Update fulfillment status</p>
      </div>

      <Card className="p-6">
        {loading ? (
          <div className="text-sm text-muted py-8">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted py-8 text-center">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brown/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Order ID</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Date</th>
                </tr>
              </thead>
              <tbody>
                {items.map((r) => (
                  <tr key={r.order.id} className="border-b border-brown/10 hover:bg-brown/2">
                    <td className="px-4 py-4 font-semibold text-brown">{r.order.id}</td>
                    <td className="px-4 py-4 text-sm text-muted">
                      {r.customerEmail ?? r.shippingEmail ?? 'Guest'}
                    </td>
                    <td className="px-4 py-4 font-semibold text-brown">${r.order.total}</td>
                    <td className="px-4 py-4">
                      <select
                        className="px-3 py-1 rounded-full text-sm font-semibold border-0 cursor-pointer"
                        style={{
                          backgroundColor: getStatusColor(r.order.status).split(' ')[0].replace('bg-', ''),
                          color: getStatusColor(r.order.status).split(' ')[1].replace('text-', ''),
                        }}
                        value={r.order.status}
                        onChange={(e) => updateStatus(r.order.id, e.target.value as Row['order']['status'])}
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted">{new Date(r.order.createdAt).toLocaleDateString()}</td>
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
