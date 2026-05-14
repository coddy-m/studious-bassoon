'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';

export const dynamic ='force-dynamic';

export default function AddProductPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  
  const [form, setForm] = useState({
    name: '',
    price: '',
    stock: '10',
    description: '',
    category: 'other',
    images: [] as string[],
  });

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    router.push('/seller/start');
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (res.ok && data.url) {
        setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
        setImagePreview(data.url);
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload error - check console');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
          active: true,
        }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        router.push('/dashboard/products');
      } else {
        setError(data.error || 'Failed to create product');
      }
    } catch (err) {
      setError('Error creating product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 rounded-full transition">
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-2xl font-bold">Add Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 bg-white border rounded-xl p-6">
        <div>
          <label className="text-sm font-medium text-gray-700">Product Name *</label>
          <input 
            required 
            value={form.name} 
            onChange={e => setForm({...form, name: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500 focus:border-transparent" 
            placeholder="e.g. Fresh Tomatoes 1kg" 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Price (KES) *</label>
            <input 
              type="number" 
              required 
              min="0"
              step="0.01"
              value={form.price} 
              onChange={e => setForm({...form, price: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500" 
              placeholder="50" 
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Stock *</label>
            <input 
              type="number" 
              required 
              min="0"
              value={form.stock} 
              onChange={e => setForm({...form, stock: e.target.value})}
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500" 
              placeholder="10" 
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <select 
            value={form.category} 
            onChange={e => setForm({...form, category: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500"
          >
            <option value="other">Other</option>
            <option value="fruits">Fruits</option>
            <option value="vegetables">Vegetables</option>
            <option value="dairy">Dairy</option>
            <option value="groceries">Groceries</option>
            <option value="meat">Meat</option>
            <option value="beverages">Beverages</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Description</label>
          <textarea 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})}
            className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-green-500" 
            rows={3} 
            placeholder="Brief description..." 
          />
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700">Product Image</label>
          <div className="mt-1 flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition">
              <Upload size={16} />
              <span className="text-sm font-medium">Upload Image</span>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="hidden" 
              />
            </label>
            {imagePreview && (
              <div className="relative">
                <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg" />
                <button 
                  type="button"
                  onClick={() => { setImagePreview(null); setForm(prev => ({ ...prev, images: [] })); }}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                >
                  <X size={12} />
                </button>
              </div>
            )}
          </div>
          {loading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
        </div>

        <div className="pt-4">
          <button 
            type="submit" 
            disabled={loading} 
            className="w-full bg-green-600 text-white font-medium py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
}