import { config as dotenvConfig } from 'dotenv'
import bcrypt from 'bcryptjs'
import { eq } from 'drizzle-orm'

import { getDb } from './index'
import { products, users } from './schema'

dotenvConfig({ path: '.env.local' })
dotenvConfig()

function statusFromStock(stock: number): 'active' | 'low-stock' | 'out-of-stock' {
  if (stock <= 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  return 'active'
}

async function seedAdmin() {
  const db = getDb()
  const passwordHash = await bcrypt.hash('admin123', 10)

  await db
    .insert(users)
    .values({
      name: 'EUNOS Admin',
      email: 'admin@eunos.com',
      passwordHash,
      role: 'admin',
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        name: 'EUNOS Admin',
        passwordHash,
        role: 'admin',
      },
    })
}

async function seedProducts() {
  const db = getDb()
  const existing = await db.select({ id: products.id }).from(products).limit(1)
  if (existing.length > 0) return

  const sample = [
    {
      name: 'Evergreen Ultralight Tent (2P)',
      description:
        'A 2-person ultralight tent built for fastpacking and weekend escapes. Breathable mesh, taped seams, and a compact footprint.',
      price: '229.99',
      category: 'camping' as const,
      stock: 14,
      images: [
        'https://picsum.photos/seed/eunos-tent-1/900/900',
        'https://picsum.photos/seed/eunos-tent-2/900/900',
      ],
    },
    {
      name: 'SummitLite Sleeping Bag 20°F',
      description:
        'Warmth without bulk. Synthetic insulation handles moisture well and packs small for shoulder-season nights.',
      price: '149.00',
      category: 'camping' as const,
      stock: 6,
      images: ['https://picsum.photos/seed/eunos-sleepingbag/900/900'],
    },
    {
      name: 'TrailPro 45L Hiking Backpack',
      description:
        'Balanced carry for day hikes to overnights. Padded hip belt, hydration sleeve, and quick-access stretch pockets.',
      price: '129.95',
      category: 'hiking' as const,
      stock: 9,
      images: ['https://picsum.photos/seed/eunos-pack/900/900'],
    },
    {
      name: 'Bamboo Trekking Poles (Pair)',
      description:
        'Lightweight, adjustable trekking poles with cork-style grips and durable tips for rocky trails.',
      price: '59.99',
      category: 'hiking' as const,
      stock: 4,
      images: ['https://picsum.photos/seed/eunos-poles/900/900'],
    },
    {
      name: 'EcoDry Rain Jacket',
      description:
        'Waterproof, breathable shell with taped seams and pit zips. Designed for sudden storms and windy ridgelines.',
      price: '119.50',
      category: 'clothing' as const,
      stock: 11,
      images: ['https://picsum.photos/seed/eunos-jacket/900/900'],
    },
    {
      name: 'Merino Base Layer Top',
      description:
        'Soft merino blend for temperature regulation and odor resistance. Ideal for long treks and camp comfort.',
      price: '74.25',
      category: 'clothing' as const,
      stock: 18,
      images: ['https://picsum.photos/seed/eunos-merino/900/900'],
    },
    {
      name: 'RidgeWalker Hiking Boots',
      description:
        'Supportive mid-height boots with a grippy outsole and reinforced toe. Built for mixed terrain and long miles.',
      price: '164.99',
      category: 'footwear' as const,
      stock: 7,
      images: ['https://picsum.photos/seed/eunos-boots/900/900'],
    },
    {
      name: 'CampCook Titanium Pot 1.2L',
      description:
        'Titanium pot with pour spout and folding handles. Perfect for boiling water and simple one-pot meals.',
      price: '49.00',
      category: 'camping' as const,
      stock: 22,
      images: ['https://picsum.photos/seed/eunos-pot/900/900'],
    },
    {
      name: 'Headlamp 400L EcoBeam',
      description:
        'Rechargeable headlamp with multiple modes and a comfortable strap. Great for night hiking and camp chores.',
      price: '34.99',
      category: 'camping' as const,
      stock: 3,
      images: ['https://picsum.photos/seed/eunos-headlamp/900/900'],
    },
    {
      name: 'Insulated Stainless Bottle 32oz',
      description:
        'Double-wall insulation keeps drinks cold or hot. Durable powder coat finish and leakproof cap.',
      price: '27.99',
      category: 'hiking' as const,
      stock: 30,
      images: ['https://picsum.photos/seed/eunos-bottle/900/900'],
    },
    {
      name: 'Trail Socks (3-Pack)',
      description:
        'Cushioned trail socks with arch support and breathable knit zones. Comfortable across long days.',
      price: '24.00',
      category: 'footwear' as const,
      stock: 0,
      images: ['https://picsum.photos/seed/eunos-socks/900/900'],
    },
    {
      name: 'Compact First Aid Kit',
      description:
        'An essentials-first kit for blisters, minor cuts, and scrapes. Organized and lightweight.',
      price: '18.75',
      category: 'hiking' as const,
      stock: 12,
      images: ['https://picsum.photos/seed/eunos-firstaid/900/900'],
    },
  ]

  await db.insert(products).values(
    sample.map((p) => ({
      ...p,
      status: statusFromStock(p.stock),
    }))
  )
}

async function main() {
  const db = getDb()
  await seedAdmin()
  await seedProducts()

  const admin = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, 'admin@eunos.com'))

  if (admin.length === 0) {
    throw new Error('Admin seed failed')
  }
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
