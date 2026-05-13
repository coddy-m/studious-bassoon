// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import connectDB from '@/lib/mongodb';
import Seller from '@/models/Seller';
import { formatPhone, generateShopId } from '@/lib/utils';
import { sendSMS } from '@/lib/at';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 👇 EXPORT THIS OBJECT (used by other API routes)
export const authOptions = {
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
      async authorize(credentials) {
        console.log('=== AUTH DEBUG ===');
        console.log('Action:', credentials?.action);
        console.log('Phone:', credentials?.phone);
        
        if (!credentials?.phone) {
          console.log('ERROR: No phone provided');
          return null;
        }
        
        const phone = formatPhone(credentials.phone);
        console.log('Formatted phone:', phone);
        
        try {
          await connectDB();
          console.log('MongoDB connected');
        } catch (err) {
          console.log('MongoDB connection FAILED:', err);
          return null;
        }
        
        let seller = await Seller.findOne({ phone });
        console.log('Seller found:', seller ? 'YES' : 'NO');

        if (credentials.action === 'request_otp') {
          const otp = generateOTP();
          const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
          console.log('Generated OTP:', otp);
          
          if (!seller) {
            console.log('Creating new seller...');
            if (!credentials.name || !credentials.businessName || !credentials.location) {
              console.log('ERROR: Missing required fields for new seller');
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
              console.log('Seller created with ID:', seller._id);
            } catch (err: any) {
              console.log('Seller creation FAILED:', err.message);
              return null;
            }
          } else {
            console.log('Updating existing seller OTP...');
            seller.otp = otp;
            seller.otpExpiry = otpExpiry;
            await seller.save();
          }

          try {
            await sendSMS(phone, `MtaaDuka code: ${otp}. Valid 10 mins.`);
            console.log('SMS sent successfully');
          } catch (err) {
            console.log('SMS failed (sandbox mode OK):', err);
          }
          
          return { id: seller._id.toString(), phone, name: seller.name, shopId: seller.shopId, requiresOTP: true } as any;
        }

        if (credentials.action === 'verify_otp') {
          console.log('Verifying OTP...');
          console.log('Seller exists:', !!seller);
          console.log('OTP expiry:', seller?.otpExpiry);
          console.log('Current time:', new Date());
          
          if (!seller) {
            console.log('ERROR: Seller not found during verify');
            return null;
          }
          if (!seller.otpExpiry || seller.otpExpiry < new Date()) {
            console.log('ERROR: OTP expired');
            return null;
          }
          
          const otpValid = seller.compareOTP(credentials.otp);
          console.log('OTP valid:', otpValid);
          
          if (!otpValid) {
            console.log('ERROR: Wrong OTP');
            return null;
          }
          
          seller.verified = true;
          seller.otp = undefined;
          await seller.save();
          console.log('Seller verified successfully');
          
          return { id: seller._id.toString(), phone: seller.phone, name: seller.name, shopId: seller.shopId, role: 'seller' };
        }

        console.log('ERROR: Unknown action');
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.shopId = user.shopId;
        token.phone = user.phone;
      }
      return token;
    },
    async session({ session, token }) {
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

// 👇 Create handler using the exported options
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };