import { Suspense } from 'react';
import { SessionProvider } from 'next-auth/react';
import LoginForm from './LoginForm';

export default function LoginPage() {
  return (
    <SessionProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      }>
        <LoginForm />
      </Suspense>
    </SessionProvider>
  );
}