export default function ProductsLoading() {
  return (
    <div className="container mx-auto px-4 py-16">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 animate-pulse">
        <div>
          <div className="h-10 bg-black/10 rounded w-64 mb-3"></div>
          <div className="h-5 bg-black/10 rounded w-96"></div>
        </div>
        <div className="h-12 bg-black/10 rounded w-48 hidden md:block"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Skeleton */}
        <div className="w-full lg:w-64 flex-shrink-0 animate-pulse hidden lg:block">
          <div className="h-6 bg-black/10 rounded w-24 mb-6"></div>
          <div className="space-y-4 mb-10">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-black/10 rounded"></div>
                <div className="h-4 bg-black/10 rounded w-32"></div>
              </div>
            ))}
          </div>
          <div className="h-6 bg-black/10 rounded w-24 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-black/10 rounded"></div>
                <div className="h-4 bg-black/10 rounded w-24"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="group flex flex-col animate-pulse">
              <div className="aspect-square bg-black/10 mb-4 rounded-xl"></div>
              <div className="h-6 bg-black/10 rounded w-3/4 mb-2"></div>
              <div className="h-5 bg-black/10 rounded w-1/4 mb-4"></div>
              <div className="flex items-center justify-between mt-auto">
                 <div className="h-8 rounded-full bg-black/10 w-24"></div>
                 <div className="h-8 rounded-full bg-black/10 w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
