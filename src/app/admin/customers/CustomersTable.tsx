'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

type Customer = {
  id: string
  name: string | null
  email: string
  role: string | null
  createdAt: Date | string
}

export function CustomersTable({ initialCustomers }: { initialCustomers: Customer[] }) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer? This action cannot be undone.')) {
      return
    }

    setDeleting(id)
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: 'DELETE',
      })
      
      if (!res.ok) {
        throw new Error('Failed to delete customer')
      }
      
      setCustomers(customers.filter(c => c.id !== id))
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Error deleting customer')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-black/60 border-b border-black/10">
            <th className="py-2">Name</th>
            <th className="py-2">Email</th>
            <th className="py-2">Role</th>
            <th className="py-2">Created</th>
            <th className="py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((u) => (
            <tr key={u.id} className="border-t border-black/10 transition-colors hover:bg-black/5">
              <td className="py-3 font-medium text-black">{u.name}</td>     
              <td className="py-3 text-black/80">{u.email}</td>
              <td className="py-3 text-black capitalize">{u.role}</td>
              <td className="py-3 text-black/60">{new Date(u.createdAt).toLocaleDateString()}</td>
              <td className="py-3 text-right">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  disabled={deleting === u.id || u.role === 'admin'}
                  onClick={() => handleDelete(u.id)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  title={u.role === 'admin' ? "Cannot delete admins" : "Delete customer"}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </td>
            </tr>
          ))}
          {customers.length === 0 && (
            <tr>
              <td colSpan={5} className="py-8 text-center text-black/50">
                No customers found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
