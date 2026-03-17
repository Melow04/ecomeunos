import Link from 'next/link'

export function Footer() {
  return (
    <footer className="border-t border-brown/10 bg-beige">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 md:grid-cols-3">
        <div>
          <div className="text-sm font-semibold text-brown">EUNOS EcoGear</div>
          <div className="mt-2 text-sm text-muted">
            Sustainable essentials for camping and hiking.
          </div>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-brown">Shop</div>
          <div className="mt-2 flex flex-col gap-2 text-muted">
            <Link href="/products?category=camping">Camping</Link>
            <Link href="/products?category=hiking">Hiking</Link>
            <Link href="/products?category=clothing">Clothing</Link>
          </div>
        </div>
        <div className="text-sm">
          <div className="font-semibold text-brown">Policies</div>
          <div className="mt-2 flex flex-col gap-2 text-muted">
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
            <a href="#">Privacy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

