# EUNOS EcoGear

EUNOS EcoGear is a full-stack e-commerce prototype for camping and hiking equipment.

## Group Project Members

This project was developed by:
- **Karmelo Andrei L. Cortes** (Designer, Lead Developer)
- **Adrian I. Aldave** (Documentor, Designer)
- **John Erick D. Mangubat** (Designer, Dev)
- **Daniel F. Villa** (Documentor, Dev)
- **Jefferson Paul M. Petronio** (Documentor, Designer)

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Neon (serverless Postgres) via `@neondatabase/serverless`
- Drizzle ORM + drizzle-kit
- NextAuth v5 (Credentials)
- Tailwind CSS + shadcn-style UI components
- Password hashing: bcryptjs

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment

Create `.env.local`:

```bash
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=replace-with-a-random-secret
```

You can generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3) Create schema in Neon (Drizzle)

```bash
npm run db:push
```

### 4) Seed admin user + sample products

```bash
npm run seed
```

Seeded admin credentials:

- Email: `admin@eunos.com`
- Password: `admin123`

First, run the development server:

```bash
npm run dev
```

Open <http://localhost:3000> with your browser to see the result.

## Notes

- Payment is fully simulated. Checkout step 3 always creates an order with status `pending`.
- Admin routes are protected by both middleware and server-side checks in route handlers.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This proje

ct uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template\&filter=next.js\&utm_source=create-next-app\&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
