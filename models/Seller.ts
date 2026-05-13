import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface ISeller extends Document {
  shopId: string;
  phone: string;
  name: string;
  businessName: string;
  mpesaNumber: string;
  category: 'mitumba' | 'food' | 'electronics' | 'beauty' | 'home' | 'services' | 'other';
  logo?: string;
  bio?: string;
  location: string;
  county: string;
  active: boolean;
  plan: 'free' | 'pro' | 'biz';
  planExpiry?: Date;
  otp?: string;
  otpExpiry?: Date;
  verified: boolean;
  totalSales: number;
  reputation: number;
  createdAt: Date;
  compareOTP(candidate: string): boolean;
}

const SellerSchema = new Schema<ISeller>({
  shopId: { type: String, required: true, unique: true, index: true },
  phone: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  businessName: { type: String, required: true },
  mpesaNumber: { type: String, required: true },
  category: { type: String, enum: ['mitumba','food','electronics','beauty','home','services','other'], required: true },
  logo: { type: String },
  bio: { type: String },
  location: { type: String, required: true },
  county: { type: String, required: true },
  active: { type: Boolean, default: true },
  plan: { type: String, enum: ['free','pro','biz'], default: 'free' },
  planExpiry: { type: Date },
  otp: { type: String },
  otpExpiry: { type: Date },
  verified: { type: Boolean, default: false },
  totalSales: { type: Number, default: 0 },
  reputation: { type: Number, default: 50 },
}, { timestamps: true });

SellerSchema.pre('save', function(next) {
  if (this.isModified('otp') && this.otp) {
    this.otp = bcrypt.hashSync(this.otp, 10);
  }
  next();
});

SellerSchema.methods.compareOTP = function(candidate: string): boolean {
  if (!this.otp) return false;
  return bcrypt.compareSync(candidate, this.otp);
};

export default mongoose.models.Seller || mongoose.model<ISeller>('Seller', SellerSchema);