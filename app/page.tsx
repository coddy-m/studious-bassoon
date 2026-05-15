// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect all visitors to the new email/password login
  redirect('/auth/login');
  return null;
}