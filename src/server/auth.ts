import 'server-only'

import { DrizzleAdapter } from '@auth/drizzle-adapter'
import type { AuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { env } from '~/env.mjs'
import { db } from './db/db'
import bcrypt from 'bcryptjs'
import { loginSchema } from '~/schemas/auth'
import { eq } from 'drizzle-orm'
import { users } from './db/schema'

export const authOptions: AuthOptions = {
  // Note: Cast required to workaround issue https://github.com/nextauthjs/next-auth/issues/8283
  adapter: DrizzleAdapter(db) as AuthOptions['adapter'],
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsedCredentials = loginSchema.safeParse(credentials)
        if (!parsedCredentials.success) return null // Invalid input
        const input = parsedCredentials.data

        const user = await db.query.users.findFirst({
          where: eq(users.email, input.email),
        })
        if (!user) return null // User not found
        if (!user.hashedPassword) return null // User has no password

        const isCorrectPassword = await bcrypt.compare(
          input.password,
          user.hashedPassword
        )
        if (!isCorrectPassword) return null // Incorrect password

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          image: user.image,
        }
      },
    }),
  ],
  pages: {
    signIn: '/profile',
  },
  callbacks: {
    session({ session, user }) {
      const sessionUser = session.user ?? {}
      sessionUser.id = user.id
      session.user = sessionUser
      return session
    },
  },
}
