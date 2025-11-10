
import { NextResponse, NextRequest } from 'next/server';
import prisma from '@/lib/prisma';


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {name , price} = body;

    if (!name || !price) {
      return new NextResponse(
        JSON.stringify({ error: 'Thiếu name hoặc price' }),
        { status: 400 } // Bad Request
      );
    }

    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice)) {
        return new NextResponse(
            JSON.stringify({ error: 'Price phải là một con số' }),
            { status: 400 }
        );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name,
        price: numericPrice, // Prisma sẽ xử lý việc chuyển đổi số sang Decimal
      },
    });
    return new NextResponse(JSON.stringify(newProduct), { status: 201 });

  } catch (error) {
    // 6. Xử lý lỗi nếu có
    console.error('Lỗi khi tạo sản phẩm:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Lỗi máy chủ nội bộ (Internal Server Error)' }),
      { status: 500 }
    );
  }
}