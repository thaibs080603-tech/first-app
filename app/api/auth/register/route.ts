import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) {
      return NextResponse.json({ error: 'username exists' }, { status: 409 });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({ data: { username, password: hashed } });

    return NextResponse.json({ id: user.id, username: user.username });
  } catch (err) {
    console.error('POST /api/auth/register error', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
