import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

function parseCookies(cookieHeader: string | null) {
  const obj: Record<string,string> = {};
  if (!cookieHeader) return obj;
  cookieHeader.split(';').forEach((part) => {
    const [k,v] = part.split('=');
    if (!k) return;
    obj[k.trim()] = decodeURIComponent((v||'').trim());
  });
  return obj;
}

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie');
    const cookies = parseCookies(cookieHeader);
    const token = cookies['token'];
    if (!token) return NextResponse.json({ error: 'no token' }, { status: 401 });

    try {
      const payload = jwt.verify(token, JWT_SECRET);
      // return the same token for socket auth (short-lived in real apps)
      return NextResponse.json({ token });
    } catch (err) {
      return NextResponse.json({ error: 'invalid' }, { status: 401 });
    }
  } catch (err) {
    console.error('GET /api/auth/socket-token error', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
