import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-primary/20 bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div>
            <div className="font-bold text-lg">EcoGear</div>
            <p className="mt-3 text-sm text-white/80">
              Your trusted partner for outdoor adventures. Quality camping and hiking gear for every explorer.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide">Shop</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
              <Link href="/products" className="hover:text-white transition-colors">All Products</Link>
              <Link href="/products?category=camping" className="hover:text-white transition-colors">Camping</Link>
              <Link href="/products?category=hiking" className="hover:text-white transition-colors">Hiking</Link>
              <Link href="/products?category=clothing" className="hover:text-white transition-colors">Clothing</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide">Customer Service</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
              <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-white transition-colors">Shipping Info</Link>
              <Link href="#" className="hover:text-white transition-colors">Returns</Link>
              <Link href="#" className="hover:text-white transition-colors">Track Order</Link>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wide">My Account</h3>
            <div className="mt-4 flex flex-col gap-3 text-sm text-white/80">
              <Link href="/account" className="hover:text-white transition-colors">Profile</Link>
              <Link href="/account?tab=orders" className="hover:text-white transition-colors">Order History</Link>
              <Link href="#" className="hover:text-white transition-colors">Wishlist</Link>
              <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-white/20 pt-8">
          <p className="text-center text-sm text-white/70">
            &copy; 2026 Eunos EcoGear. All rights reserved. | <Link href="#" className="hover:text-white">Privacy Policy</Link> | <Link href="#" className="hover:text-white">Terms of Service</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}

