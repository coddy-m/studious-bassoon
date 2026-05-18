// app/api/products/[productId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

// ✅ GET: Fetch single product for buyers/checkout
export async function GET(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await connectDB();
    const product = await Product.findOne({ productId: params.productId, active: true }).lean();
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json(product);
  } catch (error) {
    console.error('GET product error:', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

// ✅ PUT: Update product (Sellers only)
export async function PUT(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const seller = await User.findOne({ _id: session.user.id, role: 'seller' });
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

    const product = await Product.findOne({ productId: params.productId, sellerId: seller._id });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const body = await req.json();
    Object.assign(product, body);
    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ✅ DELETE: Remove product (Sellers only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { productId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const seller = await User.findOne({ _id: session.user.id, role: 'seller' });
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

    const product = await Product.findOneAndDelete({ productId: params.productId, sellerId: seller._id });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}