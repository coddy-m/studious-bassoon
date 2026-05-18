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

        // 📝 REGISTRATION FLOW
        if (credentials?.name && credentials?.phone) {
          console.log('📝 [AUTH] Registration attempt for:', clean.email);
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

          console.log('✅ [AUTH] User created with Role:', user.role);
          return { 
            id: user._id.toString(), 
            email: user.email, 
            role: user.role,
            phone: user.phone,
            name: user.name 
          };
        }

        // 🔑 LOGIN FLOW
        console.log('🔑 [AUTH] Login attempt for:', clean.email);
        const user = await User.findOne({ email: clean.email });
        
        if (!user) throw new Error('User not found');

        const isValid = await user.comparePassword(clean.password);
        if (!isValid) throw new Error('Invalid password');

        // 🔍 DEBUG: Check what role is in the database
        console.log('✅ [AUTH] Login successful. User:', user.email, 'DB Role:', user.role);

        return { 
          id: user._id.toString(), 
          email: user.email, 
          // 🔑 CRITICAL: Use DB role, fallback to 'buyer' if missing
          role: user.role || 'buyer', 
          phone: user.phone, 
          name: user.name 
        };
      },
    }),
  ],
  session: { 
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
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
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      // When logging in, 'user' is available. Update token.
      if (user) {
        console.log('🎫 [JWT] Setting token role to:', user.role);
        token.role = user.role;
        token.phone = user.phone;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (session.user) {
        console.log('👤 [SESSION] Setting session role to:', token.role);
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