# EUNOS EcoGear — Page Design Specification (Desktop-first)

## Global Styles (applies to all pages)
- Layout system: CSS Grid for page frames; Flexbox for component alignment.
- Breakpoints: desktop ≥1200px (primary); tablet 768–1199px (stack columns); mobile <768px (single column).
- Design tokens:
  - Background: #0B0F0E (dark) or #FFFFFF (light) (choose one theme and keep consistent).
  - Primary: #1F7A5C (eco green), Accent: #F2C94C (highlight), Danger: #D14343.
  - Typography: Inter / system-ui; base 16px; H1 32, H2 24, H3 20.
  - Buttons: solid primary; hover darken 8%; disabled 40% opacity.
  - Links: underline on hover; visited slightly muted.
- Shared components:
  - Top Nav: logo left, category links center, search input, account/cart icons right.
  - Footer: sustainability note, contact, policies.
  - Toasts: add-to-cart confirmation, errors.

## Page: Home / Shop
- Meta:
  - Title: “EUNOS EcoGear | Sustainable Outdoor Essentials”
  - Description: “Browse eco-friendly outdoor gear and essentials.”
  - Open Graph: title/description + primary brand image.
- Page structure (stacked sections):
  1. Top Nav (sticky)
  2. Hero strip (value prop + “Shop Now” anchor)
  3. Filter + product grid area (2-column layout)
  4. Footer
- Sections & components:
  - Left sidebar (desktop): Category list, price sort, “In stock” toggle.
  - Main grid: responsive product cards (4 columns desktop, 2 tablet, 1 mobile).
  - Product card: image, name, price, stock/published badge, “View” button.

## Page: Product Details
- Meta:
  - Title: “{Product Name} | EUNOS EcoGear”
  - Description: “Details, pricing, and availability for {Product Name}.”
- Page structure (two-column):
  - Left: image gallery (main + thumbnails)
  - Right: title, price, stock, description, quantity selector, Add to Cart
- Interaction states:
  - Add-to-cart disabled if stock=0.
  - Quantity stepper clamps to available stock.

## Page: Cart
- Meta: Title “Your Cart | EUNOS EcoGear”
- Page structure:
  - Main: cart item list (table-like rows)
  - Right rail: order summary card (subtotal, estimated shipping, total) + “Checkout” CTA
- Components:
  - Cart item row: thumbnail, name link, unit price, qty stepper, line total, remove.
  - Empty state: “Your cart is empty” + “Continue shopping” button.

## Page: Checkout (includes payment simulation)
- Meta: Title “Checkout | EUNOS EcoGear”
- Page structure (two-column):
  - Left: Shipping form + review
  - Right: Summary + simulated payment panel
- Sections & components:
  - Shipping form: name, address1, city, region, postal, country.
  - Order review: list items with snapshot prices.
  - Simulated payment module:
    - “Pay now (Simulated)” primary button.
    - Loading state while calling `simulate_payment(orderId)`.
    - Success state: show transaction ref + “Go to Account” button.
    - Failure state: show error and retry.

## Page: Login / Register
- Meta: Title “Sign in | EUNOS EcoGear”
- Page structure:
  - Centered auth card (max-width ~420px) with tabs (Login / Register)
- Components:
  - Email + password inputs, submit, inline validation.
  - “Forgot password” link (password reset flow).
  - Post-auth redirect: return to previous page or /account.

## Page: Account
- Meta: Title “My Account | EUNOS EcoGear”
- Page structure (left nav + content):
  - Left: Account menu (Profile, Orders)
  - Right: content panel
- Components:
  - Profile: display name editable; email read-only.
  - Orders list: rows (date, total, status) with detail drawer/section showing items and payment transaction ref.

## Page: Admin Console
- Meta: Title “Admin | EUNOS EcoGear”
- Access: visible/accessible only if `profiles.role = 'admin'`.
- Page structure (dashboard layout):
  - Left sidebar: Products, Categories, Orders
  - Main content: data table + edit drawer/modal
- Components:
  - Products table: name, price, stock, published toggle; actions (edit, upload image).
  - Product editor: fields + save/cancel; validation for slug uniqueness.
  - Orders table: order id, customer, total, status; actions (mark fulfilled/cancel).
  - Guard rails: destructive actions require confirm dialog.
