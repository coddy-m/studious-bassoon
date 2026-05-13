'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Edit, Trash2, PackageX, Loader2, X, Plus } from 'lucide-react';

type Props = {
  initialProducts: any[];
};

export default function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Edit Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({ name: '', price: '', stock: '', description: '' });
  const [saving, setSaving] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this product?')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      if (res.ok) {
        // Update local list immediately
        setProducts((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert('Failed to delete');
      }
    } catch {
      alert('Error deleting');
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name || '',
      price: product.price?.toString() || '',
      stock: product.stock?.toString() || '0',
      description: product.description || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          price: Number(editForm.price),
          stock: Number(editForm.stock),
          description: editForm.description,
        }),
      });
      
      if (res.ok) {
        const updatedProduct = await res.json();
        // Update local list immediately
        setProducts((prev) => 
          prev.map((p) => (p._id === updatedProduct.product._id ? updatedProduct.product : p))
        );
        setEditingProduct(null);
      } else {
        alert('Update failed');
      }
    } catch {
      alert('Error updating');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold">My Products</h1>
        </div>
        <Link 
          href="/dashboard/products/new" 
          className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-green-700"
        >
          <Plus size={18} /> Add Product
        </Link>
      </div>

      {/* Product List */}
      {products.length === 0 ? (
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center space-y-4">
          <PackageX size={48} className="mx-auto text-gray-400" />
          <div>
            <p className="text-gray-900 font-medium">No products yet</p>
            <p className="text-gray-500 text-sm mt-1">Add your first product to start selling</p>
          </div>
          <Link 
            href="/dashboard/products/new" 
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700"
          >
            + Add your first product
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product: any) => (
            <div key={product._id} className="border rounded-xl p-4 flex gap-4 items-start">
              {product.images?.[0] ? (
                <img src={product.images[0]} alt={product.name} className="w-24 h-24 object-cover rounded-lg" />
              ) : (
                <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                  <PackageX size={32} className="text-gray-400" />
                </div>
              )}
              <div className="flex-1 space-y-1">
                <h3 className="font-bold text-lg">{product.name}</h3>
                <p className="text-green-700 font-bold text-xl">KES {product.price}</p>
                <p className="text-sm text-gray-500">Stock: {product.stock ?? 0}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => openEditModal(product)} 
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                >
                  <Edit size={18} />
                </button>
                <button 
                  onClick={() => handleDelete(product._id)} 
                  disabled={deletingId === product._id}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                >
                  {deletingId === product._id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 relative">
            <button 
              onClick={() => setEditingProduct(null)} 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold">Edit Product</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input 
                  required 
                  value={editForm.name} 
                  onChange={e => setEditForm({...editForm, name: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 mt-1" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Price (KES)</label>
                  <input 
                    type="number" 
                    required 
                    value={editForm.price} 
                    onChange={e => setEditForm({...editForm, price: e.target.value})} 
                    className="w-full border rounded-lg px-3 py-2 mt-1" 
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Stock</label>
                  <input 
                    type="number" 
                    required 
                    value={editForm.stock} 
                    onChange={e => setEditForm({...editForm, stock: e.target.value})} 
                    className="w-full border rounded-lg px-3 py-2 mt-1" 
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea 
                  value={editForm.description} 
                  onChange={e => setEditForm({...editForm, description: e.target.value})} 
                  className="w-full border rounded-lg px-3 py-2 mt-1" 
                  rows={3} 
                />
              </div>
              <button 
                type="submit" 
                disabled={saving} 
                className="w-full bg-green-600 text-white font-medium py-2 rounded-lg flex justify-center items-center gap-2 disabled:opacity-50"
              >
                {saving ? <Loader2 size={18} className="animate-spin" /> : 'Save Changes'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}