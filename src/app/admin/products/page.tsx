'use client'

import * as React from 'react'

import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Plus, Edit2, Trash2, Search } from 'lucide-react'

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

function getStatusBadgeColor(status: Product['status']) {
  if (status === 'active') return 'bg-green-100 text-green-800'
  if (status === 'low-stock') return 'bg-yellow-100 text-yellow-800'
  return 'bg-red-100 text-red-800'
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
          <h1 className="text-2xl font-bold text-brown">Product Management</h1>
          <p className="mt-1 text-sm text-muted">Create, edit, and manage inventory</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <label className="text-sm font-medium text-brown">Product Name</label>
                <Input
                  placeholder="Enter product name"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-brown">Description</label>
                <Input
                  placeholder="Enter description"
                  value={draft.description}
                  onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-brown">Price</label>
                  <Input
                    placeholder="0.00"
                    value={draft.price}
                    onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-brown">Stock</label>
                  <Input
                    placeholder="0"
                    value={draft.stock}
                    onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-brown">Category</label>
                <select
                  className="mt-1 h-10 w-full rounded-md border border-brown/15 bg-white px-3 text-sm"
                  value={draft.category}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value as Product['category'] })}
                >
                  <option value="camping">Camping</option>
                  <option value="hiking">Hiking</option>
                  <option value="clothing">Clothing</option>
                  <option value="footwear">Footwear</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-brown">Image URL (optional)</label>
                <Input
                  placeholder="https://example.com/image.jpg"
                  value={draft.image}
                  onChange={(e) => setDraft({ ...draft, image: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createProduct}>Create Product</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted" />
            <Input
              placeholder="Search for products..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="secondary" onClick={() => load(q)}>
            Search
          </Button>
        </div>

        {loading ? (
          <div className="text-sm text-muted py-8">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted py-8 text-center">No products found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brown/10">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Product</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Price</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr key={p.id} className="border-b border-brown/10 hover:bg-brown/2">
                    <td className="px-4 py-4 font-semibold text-brown">{p.name}</td>
                    <td className="px-4 py-4 text-sm text-muted capitalize">{p.category}</td>
                    <td className="px-4 py-4 font-semibold text-brown">${p.price}</td>
                    <td className="px-4 py-4 text-sm text-brown font-medium">{p.stock}</td>
                    <td className="px-4 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(p.status)}`}>
                        {p.status === 'active' ? 'active' : p.status === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-4 py-4 flex gap-2">
                      <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => deleteProduct(p.id)}
                      >
                        <Trash2 className="h-4 w-4" />
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
