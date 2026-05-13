import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface IOrderItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  variant?: string;
}

export interface IOrder extends Document {
  orderId: string;
  sellerId: mongoose.Types.ObjectId;
  buyerPhone: string;
  buyerName?: string;
  items: IOrderItem[];
  total: number;
  deliveryFee: number;
  platformFee: number;
  sellerPayout: number;
  status: OrderStatus;
  mpesaRef?: string;
  checkoutRequestId?: string;
  deliveryLocation?: string;
  deliveryNotes?: string;
  createdAt: Date;
}

const OrderSchema = new Schema<IOrder>({
  orderId: { type: String, unique: true, required: true, index: true },
  sellerId: { type: Schema.Types.ObjectId, ref: 'Seller', required: true, index: true },
  buyerPhone: { type: String, required: true },
  buyerName: { type: String },
  items: [{
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    variant: { type: String },
  }],
  total: { type: Number, required: true },
  deliveryFee: { type: Number, default: 0 },
  platformFee: { type: Number, required: true },
  sellerPayout: { type: Number, required: true },
  status: { type: String, enum: ['pending','paid','processing','shipped','delivered','cancelled','refunded'], default: 'pending' },
  mpesaRef: { type: String },
  checkoutRequestId: { type: String },
  deliveryLocation: { type: String },
  deliveryNotes: { type: String },
}, { timestamps: true });

export default mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);