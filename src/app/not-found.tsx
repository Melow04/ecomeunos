import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <h2 className="text-[120px] leading-none font-black text-primary mb-2">404</h2>
      <h3 className="text-3xl font-bold text-black mb-4">Page Not Found</h3>
      <p className="text-black/60 mb-8 max-w-md text-lg">
        We couldn't find the page you were looking for. It might have been moved, deleted, or never existed.
      </p>
      <Button asChild className="h-14 px-10 text-lg bg-primary hover:bg-[#859271] text-white font-bold rounded-md shadow-none transition-transform hover:-translate-y-0.5">
        <Link href="/products">Back to Shopping</Link>
      </Button>
    </div>
  )
}
