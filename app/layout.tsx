// app/layout.tsx
import './globals.css';
import { Inter } from 'next/font/google';
import { Metadata } from 'next';
import Providers from '@/components/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MtaaDuka - Premium Marketplace',
  description: 'Buy and sell with style. Secure, fast, and M-Pesa enabled.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Animated Background */}
        <div className="animated-bg" />
        
        <Providers>
          <main className="relative z-10">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}