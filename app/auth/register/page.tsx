// app/auth/register/page.tsx
import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import RegisterForm from './RegisterForm';

export default function RegisterPage() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      }>
        <RegisterForm />
      </Suspense>
    </SessionProvider>
  );
}