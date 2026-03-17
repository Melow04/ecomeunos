import { getDb } from '@/db'
import { users } from '@/db/schema'
import { Card } from '@/components/ui/card'
import { desc } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const db = getDb()
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-brown">Customers</h1>
        <div className="mt-1 text-sm text-muted">Registered users</div>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-muted">
                <th className="py-2">Name</th>
                <th className="py-2">Email</th>
                <th className="py-2">Role</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u.id} className="border-t border-brown/10">
                  <td className="py-3 font-medium text-brown">{u.name}</td>
                  <td className="py-3 text-brown/80">{u.email}</td>
                  <td className="py-3 text-brown">{u.role}</td>
                  <td className="py-3 text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
