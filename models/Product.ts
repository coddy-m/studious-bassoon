import mongoose from 'mongoose';

const ProductSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 200 },
  price: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  description: { type: String, trim: true, maxlength: 2000 },
  category: { type: String, enum: ['fruits','vegetables','dairy','groceries','meat','beverages','other'], default: 'other', index: true },
  images: [{ type: String }],
  active: { type: Boolean, default: true, index: true },
}, { timestamps: true });

// 🚀 Compound indexes for high-traffic queries
ProductSchema.index({ sellerId: 1, active: 1 });
ProductSchema.index({ category: 1, active: 1, createdAt: -1 });

export default mongoose.models.Product || mongoose.model('Product', ProductSchema);