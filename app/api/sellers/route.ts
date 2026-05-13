import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Seller from '@/models/Seller';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    await connectDB();
    
    if (shopId) {
      const seller = await Seller.findOne({ shopId }).lean();
      if (!seller) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json(seller);
    }
    
    const sellers = await Seller.find({ active: true }).limit(20).lean();
    return NextResponse.json(sellers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}