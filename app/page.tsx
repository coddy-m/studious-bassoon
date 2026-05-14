// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirect all visitors to the seller start page
  redirect('/seller/start');
  
  // This line never executes, but TypeScript needs a return
  return null;
}