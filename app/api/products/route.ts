import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import Seller from '@/models/Seller';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get('sellerId');
    const shopId = searchParams.get('shopId');
    const productId = searchParams.get('productId');

    await connectDB();

    if (productId) {
      const product = await Product.findOne({ productId, active: true }).lean();
      if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      return NextResponse.json(product);
    }
    
    if (shopId) {
      const seller = await Seller.findOne({ shopId }).lean();
      if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
      const products = await Product.find({ sellerId: (seller as any)._id, active: true }).lean();
      return NextResponse.json({ seller, products });
    }

    if (sellerId) {
      // ✅ This matches your dashboard fetch: ?sellerId=xxx
      const products = await Product.find({ sellerId, active: true }).lean();
      console.log(`📦 Found ${products.length} products for sellerId: ${sellerId}`);
      return NextResponse.json(products);
    }

    return NextResponse.json({ error: 'Missing params (sellerId, shopId, or productId)' }, { status: 400 });
  } catch (err: any) {
    console.error('Products GET error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions); // ✅ Pass authOptions
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    await connectDB();

    const seller = await Seller.findById(session.user.id);
    if (!seller) return NextResponse.json({ error: 'Seller not found' }, { status: 404 });

    const productCount = await Product.countDocuments({ sellerId: seller._id, active: true });
    if (seller.plan === 'free' && productCount >= 20) {
      return NextResponse.json({ error: 'Free plan limit: 20 products. Upgrade to Pro.' }, { status: 403 });
    }

    const product = await Product.create({
      productId: generateId('PROD'),
      sellerId: seller._id,
      ...body,
      active: true, // ✅ Ensure new products are visible
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (err: any) {
    console.error('Products POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}