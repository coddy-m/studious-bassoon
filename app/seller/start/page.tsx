// app/seller/start/page.tsx
import { redirect } from 'next/navigation';

export default function SellerStartRedirect() {
  // Redirect all visitors to the new login page with seller role pre-selected
  redirect('/auth/login?role=seller');
  
  // This line never executes, but TypeScript requires a return
  return null;
}