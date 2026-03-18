import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="h-9 bg-black/10 rounded w-64 mb-8"></div>
      
      {/* Top Stats Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-[#FAF9F6] border-0">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium h-4 bg-black/10 rounded w-24"></CardTitle>
              <div className="h-4 w-4 bg-black/10 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-black/10 rounded w-32 mb-2"></div>
              <div className="h-3 bg-black/10 rounded w-40"></div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-[#FAF9F6] border-0">
          <CardHeader>
            <CardTitle className="h-6 bg-black/10 rounded w-32"></CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] bg-black/5 rounded w-full"></div>
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-[#FAF9F6] border-0">
          <CardHeader>
            <CardTitle className="h-6 bg-black/10 rounded w-40 mb-2"></CardTitle>
            <div className="h-4 bg-black/10 rounded w-60"></div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-black/10 mr-4"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-black/10 rounded w-32"></div>
                    <div className="h-3 bg-black/10 rounded w-48"></div>
                  </div>
                  <div className="h-4 bg-black/10 rounded w-16"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
