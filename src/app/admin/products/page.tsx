'use client'

import * as React from 'react'

import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

type Product = {
  id: string
  name: string
  description: string
  price: string
  category: 'camping' | 'hiking' | 'clothing' | 'footwear'
  stock: number
  status: 'active' | 'low-stock' | 'out-of-stock'
  images: string[]
  createdAt: string
}

function statusVariant(status: Product['status']): BadgeVariant {
  if (status === 'active') return 'green'
  if (status === 'low-stock') return 'yellow'
  return 'red'
}

export default function AdminProductsPage() {
  const [items, setItems] = React.useState<Product[]>([])
  const [loading, setLoading] = React.useState(true)
  const [q, setQ] = React.useState('')

  const [open, setOpen] = React.useState(false)
  const [draft, setDraft] = React.useState({
    name: '',
    description: '',
    price: '0',
    category: 'camping' as Product['category'],
    stock: '0',
    image: '',
  })

  async function load(query = '') {
    setLoading(true)
    const res = await fetch(`/api/admin/products${query ? `?q=${encodeURIComponent(query)}` : ''}`)
    const data = await res.json().catch(() => null)
    setItems(data?.items ?? [])
    setLoading(false)
  }

  React.useEffect(() => {
    load()
  }, [])

  async function createProduct() {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: draft.name,
        description: draft.description,
        price: Number(draft.price),
        category: draft.category,
        stock: parseInt(draft.stock || '0', 10) || 0,
        images: draft.image ? [draft.image] : [],
      }),
    })
    if (!res.ok) return
    setOpen(false)
    setDraft({ name: '', description: '', price: '0', category: 'camping', stock: '0', image: '' })
    await load(q)
  }

  async function deleteProduct(id: string) {
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) return
    setItems((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-brown">Product Management</h1>
          <div className="mt-1 text-sm text-muted">Create, edit, and manage inventory</div>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-3">
              <Input placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
              <Input placeholder="Description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Price" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
                <Input placeholder="Stock" value={draft.stock} onChange={(e) => setDraft({ ...draft, stock: e.target.value })} />
              </div>
              <select
                className="h-10 rounded-md border border-brown/15 bg-white px-3 text-sm"
                value={draft.category}
                onChange={(e) => setDraft({ ...draft, category: e.target.value as Product['category'] })}
              >
                <option value="camping">camping</option>
                <option value="hiking">hiking</option>
                <option value="clothing">clothing</option>
                <option value="footwear">footwear</option>
              </select>
              <Input placeholder="Image URL (optional)" value={draft.image} onChange={(e) => setDraft({ ...draft, image: e.target.value })} />
              <div className="flex justify-end gap-2">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createProduct}>Create</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Input placeholder="Search products" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button variant="secondary" onClick={() => load(q)}>
            Search
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted">Loading…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="py-2">Product</th>
                  <th className="py-2">Category</th>
                  <th className="py-2">Price</th>
                  <th className="py-2">Stock</th>
                  <th className="py-2">Status</th>
                  <th className="py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-t border-brown/10">
                    <td className="py-3 font-medium text-brown">{p.name}</td>
                    <td className="py-3 text-brown/80">{p.category}</td>
                    <td className="py-3 text-brown">${p.price}</td>
                    <td className="py-3 text-brown">{p.stock}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(p.status)}>{p.status}</Badge>
                    </td>
                    <td className="py-3">
                      <Button variant="ghost" onClick={() => deleteProduct(p.id)}>
                        Delete
                      </Button>
                    </td>
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
