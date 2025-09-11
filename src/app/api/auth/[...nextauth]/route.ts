import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { MongoDBAdapter } from '@next-auth/mongodb-adapter'
import { MongoClient } from 'mongodb'
import dbConnect from '@/lib/mongodb'
import User from '@/models/User'

const client = new MongoClient(process.env.MONGODB_URI!)
const clientPromise = Promise.resolve(client)

const handler = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        phone: { label: 'Phone', type: 'tel' },
        name: { label: 'Name', type: 'text' },
        isRegistering: { label: 'Is Registering', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials) return null
        await dbConnect()

        if (credentials.isRegistering === 'true') {
          const existingUser = await User.findOne({
            $or: [
              { email: credentials.email },
              { phone: credentials.phone }
            ]
          })
          
          if (existingUser) {
            throw new Error('User already exists with this email or phone')
          }

          const newUser = new User({
            name: credentials.name,
            email: credentials.email || undefined,
            phone: credentials.phone,
            role: 'client'
          })
          await newUser.save()
          
          return {
            id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            role: newUser.role
          }
        } else {
          const user = await User.findOne({
            $or: [
              { email: credentials.email },
              { phone: credentials.phone }
            ],
            role: 'client'
          })
          
          if (!user) {
            throw new Error('No user found with this email or phone')
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role
          }
        }
      }
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.phone = user.phone
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.phone = token.phone as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  }
})

export { handler as GET, handler as POST }
