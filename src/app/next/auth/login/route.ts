// src/app/api/auth/route.ts
import { NextResponse } from 'next/server';
import { api } from '@/lib/api-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    // 🚀 Dùng trực tiếp api-client thay vì fetch thủ công
    const data = await api.get('/v1/data', {
      params: { category },
      headers: {
        Authorization: `Bearer ${process.env.THIRD_PARTY_SECRET_KEY}`,
      },
    });

    // Trả kết quả về cho Client
    return NextResponse.json(data);
  } catch (error: any) {
    // api-client đã tự động throw Error(message) nếu status !== ok
    return NextResponse.json(
      { message: error.message || 'Lỗi từ Server BE' },
      { status: 500 }
    );
  }
}
