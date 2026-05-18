// lib/auth-options.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { generateShopId } from '@/lib/utils';
import { sanitizeUserInput } from '@/lib/validators';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        phone: { label: 'Phone', type: 'text' },
        role: { label: 'Role', type: 'text' },
        businessName: { label: 'Business Name', type: 'text' },
        location: { label: 'Location', type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        await connectDB();
        const clean = sanitizeUserInput(credentials);

        // 📝 REGISTRATION FLOW (when name + phone are provided)
        if (credentials?.name && credentials?.phone) {
          const existing = await User.findOne({ email: clean.email });
          if (existing) throw new Error('Email already registered');

          const user = await User.create({
            email: clean.email,
            password: clean.password,
            name: clean.name,
            phone: clean.phone,
            role: credentials.role || 'buyer',
            ...(credentials.role === 'seller' && {
              businessName: credentials.businessName,
              location: credentials.location,
              county: 'Nairobi',
              category: 'other',
              shopId: generateShopId(credentials.businessName),
              verified: true,
            }),
          });

          return { 
            id: user._id.toString(), 
            email: user.email, 
            role: user.role,
            phone: user.phone 
          };
        }

        // 🔑 LOGIN FLOW (email + password only)
        if (!clean.email || !clean.password) {
          throw new Error('Email and password required');
        }

        const user = await User.findOne({ email: clean.email });
        if (!user) throw new Error('User not found');

        const isValid = await user.comparePassword(clean.password);
        if (!isValid) throw new Error('Invalid password');

        return { 
          id: user._id.toString(), 
          email: user.email, 
          role: user.role,
          phone: user.phone, 
          name: user.name 
        };
      },
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
    updateAge: 24 * 60 * 60,
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 30 * 24 * 60 * 60,
  },
  // ✅ CRITICAL: JWT Callback - Stores role in token
  callbacks: {
    async jwt({ token, user, trigger, session }: { token: JWT; user: any; trigger?: string; session?: any }) {
      // On sign in, add user data to token
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.email = user.email;
        token.name = user.name;
        token.iat = Math.floor(Date.now() / 1000);
      }
      
      // Handle session updates (e.g., role change)
      if (trigger === 'update' && session?.role) {
        token.role = session.role;
      }
      
      return token;
    },
    // ✅ CRITICAL: Session Callback - Exposes role to client
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.role = token.role as 'buyer' | 'seller';
        session.user.phone = token.phone as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  pages: { 
    signIn: '/auth/login',
    error: '/auth/login',
  },
  debug: process.env.NODE_ENV === 'development',
};