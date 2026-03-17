import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { z } from 'zod'

import { getDb } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

type Role = 'user' | 'admin'
type AuthUser = { id: string; email: string; name: string; role: Role }

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth({
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/auth/login',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (raw) => {
        const db = getDb()
        const parsed = credentialsSchema.safeParse(raw)
        if (!parsed.success) return null

        const { email, password } = parsed.data
        const row = await db
          .select({
            id: users.id,
            email: users.email,
            name: users.name,
            role: users.role,
            passwordHash: users.passwordHash,
          })
          .from(users)
          .where(eq(users.email, email))
          .limit(1)

        const user = row[0]
        if (!user) return null

        const ok = await bcrypt.compare(password, user.passwordHash)
        if (!ok) return null

        const result: AuthUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        }

        return result as unknown as AuthUser
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        if (typeof (user as { id?: unknown }).id === 'string') {
          token.id = (user as { id: string }).id
        }
        if ((user as { role?: unknown }).role === 'user' || (user as { role?: unknown }).role === 'admin') {
          token.role = (user as { role: Role }).role
        }
      }
      return token
    },
    session: async ({ session, token }) => {
      if (session.user) {
        if (typeof token.id === 'string') session.user.id = token.id
        if (token.role === 'user' || token.role === 'admin') session.user.role = token.role
      }
      return session
    },
  },
})
