// app/checkout/CheckoutWrapper.tsx
'use client';

import { SessionProvider } from 'next-auth/react';
import { Suspense } from 'react';
import CheckoutContent from './CheckoutContent';

export default function CheckoutWrapper() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      }>
        <CheckoutContent />
      </Suspense>
    </SessionProvider>
  );
}