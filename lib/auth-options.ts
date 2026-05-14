// lib/auth-options.ts
import { AuthOptions, SessionStrategy } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { JWT } from 'next-auth/jwt';
import connectDB from '@/lib/mongodb';
import Seller from '@/models/Seller';
import { formatPhone, generateShopId } from '@/lib/utils';
import { sendSMS } from '@/lib/at';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'PhoneOTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
        name: { label: 'Name', type: 'text' },
        businessName: { label: 'Business', type: 'text' },
        location: { label: 'Location', type: 'text' },
        county: { label: 'County', type: 'text' },
        category: { label: 'Category', type: 'text' },
        action: { label: 'Action', type: 'text' },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.phone) return null;
        
        const phone = formatPhone(credentials.phone);
        
        try {
          await connectDB();
        } catch (err) {
          console.error('MongoDB connection error:', err);
          return null;
        }
        
        let seller = await Seller.findOne({ phone });

        if (credentials.action === 'request_otp') {
          const otp = generateOTP();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
          
          if (!seller) {
            if (!credentials.name || !credentials.businessName || !credentials.location) {
              return null;
            }
            try {
              seller = await Seller.create({
                phone,
                name: credentials.name,
                businessName: credentials.businessName,
                mpesaNumber: phone,
                location: credentials.location,
                county: credentials.county || 'Nairobi',
                category: credentials.category || 'other',
                shopId: generateShopId(credentials.businessName),
                otp,
                otpExpiry,
              });
            } catch (err) {
              console.error('Seller creation error:', err);
              return null;
            }
          } else {
            seller.otp = otp;
            seller.otpExpiry = otpExpiry;
            await seller.save();
          }

          try {
            await sendSMS(phone, `MtaaDuka code: ${otp}. Valid 10 mins.`);
          } catch (err) {
            console.log('SMS failed (sandbox OK):', err);
          }
          
          return { id: seller._id.toString(), phone, name: seller.name, shopId: seller.shopId, requiresOTP: true };
        }

        if (credentials.action === 'verify_otp') {
          if (!seller || !seller.otpExpiry || seller.otpExpiry < new Date()) {
            return null;
          }
          
          const otpValid = seller.compareOTP(credentials.otp);
          if (!otpValid) return null;
          
          seller.verified = true;
          seller.otp = undefined;
          await seller.save();
          
          return { id: seller._id.toString(), phone: seller.phone, name: seller.name, shopId: seller.shopId, role: 'seller' };
        }

        return null;
      },
    }),
  ],
  session: { 
    strategy: 'jwt' as SessionStrategy,  // ✅ Explicit type cast
    maxAge: 30 * 24 * 60 * 60 
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }): Promise<JWT> {
      if (user) {
        token.shopId = user.shopId;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }): Promise<any> {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.shopId = token.shopId;
        session.user.phone = token.phone;
      }
      return session;
    },
  },
  pages: { signIn: '/seller/start', error: '/seller/start' },
  debug: true,
};