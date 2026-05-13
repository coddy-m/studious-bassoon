import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Order from '@/models/Order';
import Product from '@/models/Product';
import Seller from '@/models/Seller';
import { sendWhatsApp } from '@/lib/at';
import { b2cPayout } from '@/lib/mpesa';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';

const redis = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
const notificationQueue = new Queue('notifications', { connection: redis });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = body.Body?.stkCallback;

    if (!result) return NextResponse.json({ success: true });

    await connectDB();
    const order = await Order.findOne({ checkoutRequestId: result.CheckoutRequestID }).populate('sellerId');

    if (!order) return NextResponse.json({ success: true });

    if (result.ResultCode === 0) {
      order.status = 'paid';
      order.mpesaRef = result.CallbackMetadata?.Item?.find((i: any) => i.Name === 'MpesaReceiptNumber')?.Value;
      await order.save();

      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity, sold: item.quantity } });
      }

      await Seller.findByIdAndUpdate(order.sellerId._id, { $inc: { totalSales: order.sellerPayout } });

      await notificationQueue.add('notify-seller', {
        sellerPhone: (order.sellerId as any).phone,
        orderId: order.orderId,
        buyerName: order.buyerName || order.buyerPhone,
        total: order.total,
        items: order.items.map((i: any) => `${i.name} x${i.quantity}`).join(', '),
      });

      await notificationQueue.add('notify-buyer', {
        buyerPhone: order.buyerPhone,
        orderId: order.orderId,
        sellerName: (order.sellerId as any).businessName,
        total: order.total,
      });

      try {
        await b2cPayout((order.sellerId as any).mpesaNumber, order.sellerPayout, `Order ${order.orderId}`);
      } catch (payoutErr) {
        console.error('B2C payout failed:', payoutErr);
      }
    } else {
      order.status = 'cancelled';
      await order.save();
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ success: true });
  }
}