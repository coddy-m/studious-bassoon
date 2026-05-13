import { NextRequest, NextResponse } from 'next/server';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // 👇 ADD DEBUG LOG
    console.log('📤 Upload attempt:', { 
      filename: file.name, 
      size: file.size, 
      type: file.type 
    });
    
    const url = await uploadImage(buffer);

    return NextResponse.json({ success: true, url });
  } catch (err: any) {
    // 👇 REPLACE with detailed logging:
    console.error('❌ Upload FAILED:', {
      message: err.message,
      name: err.name,
      stack: err.stack,
      cloudinaryEnvSet: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY)
    });
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}