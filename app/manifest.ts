// app/manifest.ts
import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MtaaDuka - Local Marketplace',
    short_name: 'MtaaDuka',
    description: 'Buy and sell locally in your neighborhood',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#16a34a',
    icons: [
      {
        src: '/icon.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable', // ✅ Fixed: Next.js expects single value
      },
      {
        src: '/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable', // ✅ Fixed
      },
    ],
  };
}