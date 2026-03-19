import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-black">Settings</h1>
        <div className="mt-1 text-sm font-semibold text-black/60">Manage your store preferences and configurations.</div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 rounded-xl border-black/10 bg-white shadow-sm">
          <CardHeader className="p-0\nmb-4">
            <CardTitle className="text-lg font-black">General Store Info</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div>
              <label className="text-sm font-bold text-black/70 mb-1 block">Store Name</label>
              <Input defaultValue="EcoGear" className="bg-black/5 border-transparent" />
            </div>
            <div>
              <label className="text-sm font-bold text-black/70 mb-1 block">Support Email</label>
              <Input defaultValue="support@ecogear.com" className="bg-black/5 border-transparent" />
            </div>
            <div>
              <label className="text-sm font-bold text-black/70 mb-1 block">Order Prefix</label>
              <Input defaultValue="ECO-" className="bg-black/5 border-transparent" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        <Card className="p-6 rounded-xl border-black/10 bg-white shadow-sm">
          <CardHeader className="p-0\nmb-4">
            <CardTitle className="text-lg font-black">Currency &amp; Region</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div>
              <label className="text-sm font-bold text-black/70 mb-1 block">Base Currency</label>
              <select className="flex h-10 w-full rounded-md bg-black/5 px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                <option>USD ($)</option>
                <option>EUR (\&#8364;)</option>
                <option>GBP (\&#163;)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-black/70 mb-1 block">Tax Rate (%)</label>
              <Input type="number" defaultValue="8" className="bg-black/5 border-transparent" />
            </div>
            <div>
              <label className="text-sm font-bold text-black/70 mb-1 block">Default Shipping Fee</label>
              <Input type="number" defaultValue="9.99" className="bg-black/5 border-transparent" />
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}