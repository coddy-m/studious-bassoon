// app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

// ✅ GET: Fetch orders for logged-in user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ buyerId: session.user.id })
      .populate('productId sellerId')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(orders);
  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// ✅ POST: Create new order with M-Pesa
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { productId, sellerId, quantity, phone, totalAmount } = body;

    console.log('🔍 DEBUG - Order Request:', { productId, sellerId, quantity, phone, totalAmount });

    // ✅ Validate sellerId
    if (!sellerId || sellerId === 'undefined' || sellerId.length !== 24) {
      console.error('❌ Invalid sellerId:', sellerId);
      return NextResponse.json({ 
        error: 'Invalid seller ID. Please go back and try again.' 
      }, { status: 400 });
    }

    await connectDB();

    // ✅ Verify seller exists
    const seller = await User.findById(sellerId).lean();
    if (!seller) {
      return NextResponse.json({ error: 'Seller not found' }, { status: 404 });
    }

    // ✅ Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (product.stock < quantity) {
      return NextResponse.json({ error: 'Insufficient stock' }, { status: 400 });
    }

    // ✅ Create order
    const order = await Order.create({
      orderId: `ORD-${Date.now()}`,
      buyerId: session.user.id,
      sellerId: seller._id,
      productId: product._id,
      quantity,
      totalAmount,
      phone,
      status: 'pending',
    });

    return NextResponse.json({ 
      success: true, 
      orderId: order.orderId,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error: any) {
    console.error('❌ Order creation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}