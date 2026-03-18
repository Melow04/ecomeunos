'use client'

import * as React from 'react'
import { CldUploadWidget } from 'next-cloudinary'

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
  isFeatured: boolean
  isNew: boolean
  isSale: boolean
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
  const [editingId, setEditingId] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState({
    name: '',
    description: '',
    price: '0',
    category: 'camping' as Product['category'],
    stock: '0',
    image: '',
    isFeatured: false,
    isNew: false,
    isSale: false,
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

  async function saveProduct() {
    const url = editingId ? `/api/admin/products/${editingId}` : '/api/admin/products'
    const method = editingId ? 'PATCH' : 'POST'
    
    const res = await fetch(url, {
      method,
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: draft.name,
        description: draft.description,
        price: parseFloat(draft.price) || 0,
        category: draft.category,
        stock: parseInt(draft.stock || '0', 10) || 0,
        images: draft.image ? [draft.image] : [],
        isFeatured: draft.isFeatured,
        isNew: draft.isNew,
        isSale: draft.isSale,
      }),
    })
    if (!res.ok) return
    setOpen(false)
    setEditingId(null)
    setDraft({ name: '', description: '', price: '0', category: 'camping', stock: '0', image: '', isFeatured: false, isNew: false, isSale: false })
    await load(q)
  }

  function handleEdit(product: Product) {
    setEditingId(product.id)
    setDraft({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock.toString(),
      image: product.images[0] || '',
      isFeatured: product.isFeatured || false,
      isNew: product.isNew || false,
      isSale: product.isSale || false,
    })
    setOpen(true)
  }

  function handleAdd() {
    setEditingId(null)
    setDraft({ name: '', description: '', price: '0', category: 'camping', stock: '0', image: '', isFeatured: false, isNew: false, isSale: false })
    setOpen(true)
  }

  async function deleteProduct(id: string) {
    if (!confirm('Are you sure you want to delete this product?')) return
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      alert('Failed to delete product')
      return
    }
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
          <Button className="gap-2" onClick={handleAdd}>
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit Product' : 'Add New Product'}</DialogTitle>
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
              
              <div className="grid grid-cols-3 gap-4 border-t border-b border-brown/10 py-4">
                <label className="flex items-center gap-2 text-sm font-medium text-brown cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={draft.isFeatured}
                    onChange={(e) => setDraft({ ...draft, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-brown cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={draft.isNew}
                    onChange={(e) => setDraft({ ...draft, isNew: e.target.checked })}
                  />
                  New Arrival
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-brown cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={draft.isSale}
                    onChange={(e) => setDraft({ ...draft, isSale: e.target.checked })}
                  />
                  On Sale
                </label>
              </div>

              <div>
                <label className="text-sm font-medium text-brown mb-1 block">Product Image</label>
                <div className="flex items-center gap-4">
                  {draft.image && (
                    <img src={draft.image} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                  )}
                  <CldUploadWidget 
                    onSuccess={(result: any) => {
                      if (result.info?.secure_url) {
                        setDraft({ ...draft, image: result.info.secure_url })
                      }
                    }}
                    options={{ 
                      maxFiles: 1,
                      styles: {
                        palette: {
                          window: '#FFFFFF',
                          sourceBg: '#F3F0E8',
                          windowBorder: '#9CA986',
                          tabIcon: '#3D3D37',
                          inactiveTabIcon: '#8B8B85',
                          menuIcons: '#3D3D37',
                          link: '#9CA986',
                          action: '#9CA986',
                          inProgress: '#9CA986',
                          complete: '#9CA986',
                          error: '#D14343',
                          textDark: '#1A1A1A',
                          textLight: '#FFFFFF'
                        }
                      }
                    }}
                    uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "default_preset"}
                  >
                    {({ open }) => (
                      <Button type="button" variant="secondary" onClick={() => open()}>
                        Upload Image
                      </Button>
                    )}
                  </CldUploadWidget>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveProduct}>{editingId ? 'Save Changes' : 'Create Product'}</Button>
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
              onKeyDown={(e) => e.key === 'Enter' && load(q)}
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
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:bg-blue-50"
                        onClick={() => handleEdit(p)}
                      >
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
