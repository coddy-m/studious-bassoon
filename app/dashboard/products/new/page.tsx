// app/dashboard/products/new/page.tsx
import dynamic from 'next/dynamic';

// ✅ Force dynamic rendering at the page level
export const dynamic = 'force-dynamic';

// ✅ Dynamically import the form with SSR disabled
// This guarantees the component ONLY runs in the browser
const AddProductForm = dynamic(
  () => import('./AddProductForm'),
  { 
    ssr: false,  // 🔑 Critical: Never server-render this component
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    )
  }
);

export default function AddProductPage() {
  return <AddProductForm />;
}