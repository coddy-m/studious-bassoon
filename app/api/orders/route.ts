import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth-options'; // ✅ MUST import this
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Seller from '@/models/Seller';

export async function GET(req: NextRequest) {
  // ✅ Pass authOptions to getServerSession
  const session = await getServerSession(authOptions);
  console.log('Session in orders API:', session?.user?.id);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized', details: 'No session or user ID' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    await connectDB();

    const query: any = { sellerId: session.user.id };
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 }).limit(50).lean();
    return NextResponse.json(orders);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Keep your existing POST function unchanged below...