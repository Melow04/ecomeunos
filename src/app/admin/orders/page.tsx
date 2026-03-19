'use client'

import * as React from 'react'

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

function getStatusBadgeColor(status: string) {
  switch(status) {
    case 'pending': return 'bg-orange-200 text-orange-800'
    case 'processing':
    case 'shipped': return 'bg-blue-300 text-blue-800'
    case 'delivered': return 'bg-green-400 text-green-900'
    default: return 'bg-red-400 text-red-900'
  }
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
    <div className="space-y-8 max-w[1400px] w-full mx-auto">
      <h1 className="text-2xl font-bold text-black">Order Management</h1>

      <Card className="p-8 border border-black/10 shadow-sm rounded-2xl bg-white">
        {loading ? (
          <div className="text-sm text-black/60 py-8">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-black/60 py-8 text-center">No orders found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="border-b border-black/10 text-black">
                <tr>
                  <th className="px-4 py-4 font-bold">Order ID</th>
                  <th className="px-4 py-4 font-bold">Customer</th>
                  <th className="px-4 py-4 font-bold">Amount</th>
                  <th className="px-4 py-4 font-bold">Status</th>
                  <th className="px-4 py-4 font-bold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {items.map((r) => (
                  <tr key={r.order.id} className="hover:bg-black/5">
                    <td className="px-4 py-6 font-bold text-black">ORD-{r.order.id.toString().padStart(3, '0')}</td>
                    <td className="px-4 py-6 font-medium text-black/80">
                      {r.customerEmail ?? r.shippingEmail ?? 'Guest'}
                    </td>
                    <td className="px-4 py-6 font-bold text-black">${r.order.total}</td>
                    <td className="px-4 py-6">
                      <select
                        className={`px-3 py-1 rounded-full text-[11px] font-extrabold outline-none appearance-none cursor-pointer ${getStatusBadgeColor(r.order.status)}`}
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
                    <td className="px-4 py-6 font-medium text-black/80">{new Date(r.order.createdAt).toISOString().split('T')[0]}</td>
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
