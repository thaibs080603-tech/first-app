import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;
    if (!username || !password) {
      return NextResponse.json({ error: 'username and password required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return NextResponse.json({ error: 'invalid credentials' }, { status: 401 });

    const token = jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

    // set HttpOnly cookie
    const res = NextResponse.json({ username: user.username });
    const maxAge = 7 * 24 * 60 * 60; // 7 days
    res.headers.set('Set-Cookie', `token=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`);
    return res;
  } catch (err) {
    console.error('POST /api/auth/login error', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
