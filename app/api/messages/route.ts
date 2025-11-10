import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const room = searchParams.get('room') ?? 'general';
    const before = searchParams.get('before');
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    if (before) {
      // load earlier messages older than `before`
      const messages = await prisma.message.findMany({
        where: { room, createdAt: { lt: new Date(before) } },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return NextResponse.json(messages.reverse());
    }

    // default: load latest `limit` messages
    const latest = await prisma.message.findMany({
      where: { room },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return NextResponse.json(latest.reverse());
  } catch (err) {
    console.error('GET /api/messages error', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
