import {
  boolean,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core'

export const userRoleEnum = pgEnum('user_role', ['user', 'admin'])
export const productCategoryEnum = pgEnum('product_category', [
  'camping',
  'hiking',
  'clothing',
  'footwear',
])
export const productStatusEnum = pgEnum('product_status', [
  'active',
  'low-stock',
  'out-of-stock',
])
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
])
export const shippingMethodEnum = pgEnum('shipping_method', [
  'standard',
  'express',
  'overnight',
])

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  description: text('description').notNull(),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  category: productCategoryEnum('category').notNull(),
  stock: integer('stock').notNull(),
  status: productStatusEnum('status').notNull().default('active'),
  images: text('images').array().notNull().default([]),
  isFeatured: boolean('is_featured').notNull().default(false),
  isNew: boolean('is_new').notNull().default(false),
  isSale: boolean('is_sale').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  status: orderStatusEnum('status').notNull().default('pending'),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  shippingCost: numeric('shipping_cost', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).notNull(),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  shippingMethod: shippingMethodEnum('shipping_method').notNull(),
  guestEmail: varchar('guest_email', { length: 320 }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  productId: uuid('product_id')
    .notNull()
    .references(() => products.id, { onDelete: 'restrict' }),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
})

export const shippingAddresses = pgTable('shipping_addresses', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderId: uuid('order_id')
    .notNull()
    .references(() => orders.id, { onDelete: 'cascade' }),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  phone: varchar('phone', { length: 40 }).notNull(),
  street: varchar('street', { length: 240 }).notNull(),
  city: varchar('city', { length: 120 }).notNull(),
  state: varchar('state', { length: 120 }).notNull(),
  zip: varchar('zip', { length: 20 }).notNull(),
})

export const cart = pgTable(
  'cart',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userIdUnique: uniqueIndex('cart_user_id_unique').on(t.userId),
  })
)

export const cartItems = pgTable(
  'cart_items',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    cartId: uuid('cart_id')
      .notNull()
      .references(() => cart.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'restrict' }),
    quantity: integer('quantity').notNull(),
  },
  (t) => ({
    cartProductUnique: uniqueIndex('cart_items_cart_product_unique').on(
      t.cartId,
      t.productId
    ),
  })
)

export const wishlists = pgTable(
  'wishlists',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    productId: uuid('product_id')
      .notNull()
      .references(() => products.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    userProductUnique: uniqueIndex('wishlists_user_product_unique').on(
      t.userId,
      t.productId
    ),
  })
)
