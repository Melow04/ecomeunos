import { getDb } from '@/db'
import { users } from '@/db/schema'
import { Card } from '@/components/ui/card'
import { desc } from 'drizzle-orm'
import { CustomersTable } from './CustomersTable'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  const db = getDb()
  const rows = await db.select().from(users).orderBy(desc(users.createdAt)).limit(200)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-black">Customers</h1>
        <div className="mt-1 text-sm text-black/60">Registered users</div>
      </div>

      <Card className="p-6">
        <CustomersTable initialCustomers={rows} />
      </Card>
    </div>
  )
}
