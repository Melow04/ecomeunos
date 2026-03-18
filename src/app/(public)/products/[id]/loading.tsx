export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-16 animate-pulse">
      <div className="grid gap-12 lg:grid-cols-2">
        {/* Image Skeleton */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl bg-black/10"></div>
          <div className="flex gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square w-20 rounded-md bg-black/10"></div>
            ))}
          </div>
        </div>

        {/* Content Skeleton */}
        <div className="space-y-8">
          <div className="space-y-4 shadow-sm border border-black/5 p-6 rounded-2xl bg-white">
            <div className="w-24 h-6 bg-black/10 rounded-full"></div>
            <div className="w-3/4 h-10 bg-black/10 rounded"></div>
            <div className="w-1/4 h-8 bg-black/10 rounded"></div>
            <div className="space-y-2 mt-6">
              <div className="w-full h-4 bg-black/10 rounded"></div>
              <div className="w-full h-4 bg-black/10 rounded"></div>
              <div className="w-5/6 h-4 bg-black/10 rounded"></div>
            </div>
            <div className="mt-8">
              <div className="w-1/3 h-6 bg-black/10 rounded mb-4"></div>
              <div className="w-full h-12 bg-black/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
