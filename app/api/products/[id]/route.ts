import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Seller from '@/models/Seller';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const seller = await Seller.findById(session.user.id);
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

    const product = await Product.findOne({ _id: id, sellerId: seller._id });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const body = await req.json();
    Object.assign(product, body);
    await product.save();

    return NextResponse.json({ success: true, product });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await connectDB();
    const seller = await Seller.findById(session.user.id);
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

    const product = await Product.findOneAndDelete({ _id: id, sellerId: seller._id });
    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    return NextResponse.json({ success: true, message: 'Product deleted' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}