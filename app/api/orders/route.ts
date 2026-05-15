import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import { generateId } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const query = session.user.role === 'seller' 
    ? { sellerId: session.user.id } 
    : { buyerId: session.user.id };

  const orders = await Order.find(query).sort({ createdAt: -1 }).lean();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'buyer') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await connectDB();
  const body = await req.json();
  
  const order = await Order.create({
    orderId: generateId('ORD'),
    buyerId: session.user.id,
    sellerId: body.sellerId,
    productId: body.productId,
    quantity: body.quantity || 1,
    totalAmount: body.totalAmount,
    phone: session.user.phone, // For M-Pesa STK
    status: 'pending',
  });

  return NextResponse.json(order, { status: 201 });
}