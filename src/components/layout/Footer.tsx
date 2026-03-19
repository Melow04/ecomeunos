import Image from 'next/image'
import Link from 'next/link'
import { Mountain } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-black/5 bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-4 md:gap-8">
          <div>
            <div className="flex items-center gap-2 font-black text-xl tracking-tight text-white mb-4">
              <div className="bg-white rounded-full p-1 flex items-center justify-center">
                <Image src="/logo.svg" alt="EcoGear Logo" width={32} height={32} className="w-auto h-8" />
              </div>
              EcoGear
            </div>
            <p className="mt-3 text-sm text-white/90 leading-relaxed pr-8">
              Your trusted partner for outdoor adventures. Quality camping and hiking gear for every explorer.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-base mb-6">Shop</h3>
            <div className="flex flex-col gap-4 text-sm text-white/80 font-medium">
              <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
              <Link href="/products?category=camping" className="hover:text-white transition-colors">Camping</Link>
              <Link href="/products?category=hiking" className="hover:text-white transition-colors">Hiking</Link>
              <Link href="/products?category=clothing" className="hover:text-white transition-colors">Clothing</Link>
              <Link href="/products?category=footwear" className="hover:text-white transition-colors">Footwear</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base mb-6">Customer Service</h3>
            <div className="flex flex-col gap-4 text-sm text-white/80 font-medium">
              <Link href="/help" className="hover:text-white transition-colors">Help Center</Link>
              <Link href="/shipping" className="hover:text-white transition-colors">Shipping Info</Link>
              <Link href="/returns" className="hover:text-white transition-colors">Returns</Link>
              <Link href="/track" className="hover:text-white transition-colors">Track Order</Link>
              <Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-base mb-6">My Account</h3>
            <div className="flex flex-col gap-4 text-sm text-white/80 font-medium">
              <Link href="/account" className="hover:text-white transition-colors">Profile</Link>
              <Link href="/account?tab=orders" className="hover:text-white transition-colors">Order History</Link>
              <Link href="/account?tab=wishlist" className="hover:text-white transition-colors">Wishlist</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
              <Link href="/auth/register" className="hover:text-white transition-colors">Register</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8 mt-4">
          <p className="text-center text-xs font-medium text-white/80">
            2026 Eunos EcoGear. All rights Reserved. | <Link href="/privacy" className="hover:text-white">Privacy Policy</Link> | <Link href="/terms" className="hover:text-white">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

