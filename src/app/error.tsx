'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Optionally log to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6 rounded-full bg-red-100 p-6 text-red-600">
        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h2 className="text-4xl font-black text-black mb-4">Oops! Something went wrong</h2>
      <p className="text-black/60 mb-8 max-w-md text-lg">
        We encountered an unexpected issue while loading this page. Our engineers have been pinged.
      </p>
      <Button 
        onClick={() => reset()} 
        className="h-14 px-10 text-lg bg-black hover:bg-black/80 text-white font-bold rounded-md shadow-none transition-transform hover:-translate-y-0.5"
      >
        Try again
      </Button>
    </div>
  )
}
