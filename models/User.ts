// models/User.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  phone: { type: String, required: true, trim: true }, // Required for M-Pesa & notifications
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['buyer', 'seller'], default: 'buyer', index: true },
  
  // Seller-specific fields (optional for buyers)
  businessName: { type: String, trim: true },
  location: { type: String, trim: true },
  county: { type: String, trim: true },
  category: { type: String, trim: true },
  shopId: { type: String, unique: true, sparse: true }, // Only sellers get this
  verified: { type: Boolean, default: false },
}, { timestamps: true });

// 🔐 Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// 🔍 Compare password for login
UserSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

// 🚀 Indexes for fast queries
UserSchema.index({ role: 1 });
UserSchema.index({ shopId: 1 });
UserSchema.index({ phone: 1 });

export default mongoose.models.User || mongoose.model('User', UserSchema);