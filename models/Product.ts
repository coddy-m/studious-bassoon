import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  productId: string;
  sellerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  price: number;
  comparePrice?: number;
  images: string[];
  stock: number;
  sold: number;
  category: string;
  active: boolean;
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  productId: { type: String, unique: true, required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  comparePrice: { type: Number },
  images: [{ type: String }],
  stock: { type: Number, default: 1 },
  sold: { type: Number, default: 0 },
  category: { type: String, required: true },
  active: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);