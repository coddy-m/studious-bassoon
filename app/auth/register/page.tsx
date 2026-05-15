// app/auth/register/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { SessionProvider } from 'next-auth/react';

// ✅ Prevent static generation
export const dynamic = 'force-dynamic';

function RegisterForm() {
  // ... rest of your existing register code ...
  // (keep all your existing logic, just add the export above)
}

export default function RegisterPage() {
  return (
    <SessionProvider>
      <RegisterForm />
    </SessionProvider>
  );
}