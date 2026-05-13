import mongoose from 'mongoose';

const FALLBACK_URI = 'mongodb://localhost:27017/default';
const MONGODB_URI = process.env.MONGODB_URI || FALLBACK_URI;

console.log('ENV URI exists:', !!process.env.MONGODB_URI);
console.log('URI prefix:', MONGODB_URI.substring(0, 30));

if (!MONGODB_URI) throw new Error('Please define MONGODB_URI');

const cached = (global as any).mongoose || { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => m);
    (global as any).mongoose = cached;
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;