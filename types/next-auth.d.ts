import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      phone?: string;
      role?: string;
      shopId?: string;
    };
  }
  interface User {
    role?: string;
    phone?: string;
    shopId?: string;
    requiresOTP?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role?: string;
    phone?: string;
    shopId?: string;
  }
}