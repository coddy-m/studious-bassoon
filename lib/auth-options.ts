// lib/auth-options.ts
import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
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

          return { id: user._id.toString(), email: user.email, role: user.role, phone: user.phone };
        }

        // 🔑 LOGIN FLOW (email + password only)
        if (!clean.email || !clean.password) {
          throw new Error('Email and password required');
        }

        const user = await User.findOne({ email: clean.email });
        if (!user) throw new Error('User not found');

        const isValid = await user.comparePassword(clean.password);
        if (!isValid) throw new Error('Invalid password');

        return { id: user._id.toString(), email: user.email, role: user.role, phone: user.phone, name: user.name };
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
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
  jwt: { secret: process.env.NEXTAUTH_SECRET },
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.role = user.role;
        token.phone = user.phone;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.phone = token.phone;
        session.user.email = token.email;
      }
      return session;
    },
  },
  pages: { signIn: '/auth/login' },
};