import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Seller from '@/models/Seller';
import Product from '@/models/Product';
import Order from '@/models/Order';
import { formatPhone, generateId } from '@/lib/utils';
import { stkPush } from '@/lib/mpesa';

const ussdSessions = new Map();
const getUSSDSession = (sessionId: string) => ussdSessions.get(sessionId);
const setUSSDSession = (sessionId: string, data: any) => ussdSessions.set(sessionId, data);

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const sessionId = data.get('sessionId') as string;
    const phone = formatPhone(data.get('phoneNumber') as string);
    const text = (data.get('text') as string) || '';

    const parts = text.split('*');
    const level = parts.length;
    const input = parts[parts.length - 1];

    let response = '';
    let session = await getUSSDSession(sessionId) || { step: 'menu', data: {} };

    await connectDB();

    if (text === '') {
      response = `CON Welcome to MtaaDuka\n1. Browse Shops\n2. Search by Seller Code\n3. My Orders\n0. Exit`;
      session.step = 'menu';
    } else if (session.step === 'menu' && input === '1') {
      const sellers = await Seller.find({ active: true }).limit(5).lean();
      response = `CON Shops Near You:\n`;
      sellers.forEach((s: any, i: number) => {
        response += `${i + 1}. ${s.businessName.substring(0, 15)}\n`;
      });
      response += `0. Back`;
      session.step = 'shop_list';
      session.data.sellers = sellers.map((s: any) => s._id.toString());
    } else if (session.step === 'shop_list' && level === 2) {
      const idx = parseInt(input) - 1;
      const sellerId = session.data.sellers?.[idx];
      if (!sellerId) {
        response = `END Invalid selection.`;
      } else {
        const products = await Product.find({ sellerId, active: true, stock: { $gt: 0 } }).limit(5).lean();
        response = `CON Products:\n`;
        products.forEach((p: any, i: number) => {
          response += `${i + 1}. ${p.name.substring(0, 12)} KES${p.price}\n`;
        });
        response += `0. Back`;
        session.step = 'product_list';
        session.data.sellerId = sellerId;
        session.data.products = products.map((p: any) => ({ id: p._id.toString(), name: p.name, price: p.price }));
      }
    } else if (session.step === 'product_list' && level === 3) {
      const idx = parseInt(input) - 1;
      const product = session.data.products?.[idx];
      if (!product) {
        response = `END Invalid choice.`;
      } else {
        response = `CON ${product.name} - KES ${product.price}\nEnter quantity (1-5):`;
        session.step = 'quantity';
        session.data.selectedProduct = product;
      }
    } else if (session.step === 'quantity' && level === 4) {
      const qty = parseInt(input);
      if (!qty || qty < 1 || qty > 5) {
        response = `END Invalid quantity.`;
      } else {
        const product = session.data.selectedProduct;
        const total = product.price * qty;
        response = `CON Total: KES ${total}\n1. Pay via M-Pesa\n2. Cancel`;
        session.step = 'confirm';
        session.data.quantity = qty;
        session.data.total = total;
      }
    } else if (session.step === 'confirm' && level === 5 && input === '1') {
      const seller = await Seller.findById(session.data.sellerId);
      if (!seller) {
        response = `END Seller not found.`;
      } else {
        const orderId = generateId('ORD-USSD');
        await Order.create({
          orderId,
          sellerId: seller._id,
          buyerPhone: phone,
          items: [{
            productId: session.data.selectedProduct.id,
            name: session.data.selectedProduct.name,
            price: session.data.selectedProduct.price,
            quantity: session.data.quantity,
          }],
          total: session.data.total,
          platformFee: Math.round(session.data.total * 0.02),
          sellerPayout: session.data.total - Math.round(session.data.total * 0.02),
          status: 'pending',
        });

        const callbackUrl = `${process.env.NEXTAUTH_URL}/api/orders/callback`;
        await stkPush(phone, session.data.total, orderId, callbackUrl);
        response = `END M-Pesa request sent. Enter PIN. Order: ${orderId}`;
      }
    } else {
      response = `END Asante for using MtaaDuka.`;
    }

    await setUSSDSession(sessionId, session);
    return new NextResponse(response, { headers: { 'Content-Type': 'text/plain' } });
  } catch (err) {
    console.error('USSD error:', err);
    return new NextResponse(`END Error. Try again.`, { headers: { 'Content-Type': 'text/plain' } });
  }
}