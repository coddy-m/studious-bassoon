import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';

export async function PUT(req: NextRequest, { params }: { params: { orderId: string } }) {
  const session = await getServerSession();
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { status } = await req.json();
    await connectDB();

    const order = await Order.findOne({ orderId: params.orderId, sellerId: session.user.id });
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const validTransitions: Record<string, string[]> = {
      pending: [],
      paid: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: [],
      cancelled: [],
      refunded: [],
    };

    if (!validTransitions[order.status]?.includes(status)) {
      return NextResponse.json({ error: `Cannot transition from ${order.status} to ${status}` }, { status: 400 });
    }

    order.status = status;
    await order.save();

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}