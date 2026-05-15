import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  totalAmount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'paid', 'shipped', 'completed', 'cancelled'], default: 'pending', index: true },
  mpesaReceipt: { type: String, trim: true },
  phone: { type: String, required: true, trim: true }, // For STK push
}, { timestamps: true });

OrderSchema.index({ buyerId: 1, status: 1 });
OrderSchema.index({ sellerId: 1, createdAt: -1 });

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);