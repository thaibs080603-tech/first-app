const http = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// In local dev, socket server runs on 3001. In Railway with multiple services, 
// each service gets its own PORT variable. If SOCKET_PORT is set, use it (for multi-port setup).
// Otherwise default to 3001 for local development.
const PORT = process.env.SOCKET_PORT || 3001;

const httpServer = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Socket server');
});

const io = new Server(httpServer, {
  path: '/api/socket',
  cors: { origin: '*' }
});

// auth middleware: expect a token in socket.handshake.auth.token
io.use((socket, next) => {
  const token = socket.handshake.auth && socket.handshake.auth.token;
  if (!token) return next(new Error('unauthorized'));
  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    socket.user = payload;
    next();
  } catch (err) {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-room', (room) => {
    socket.join(room);
    console.log(`${socket.id} joined ${room}`);
  });

  socket.on('leave-room', (room) => {
    socket.leave(room);
    console.log(`${socket.id} left ${room}`);
  });

  socket.on('send-message', async ({ content, sender, room, clientId }) => {
    try {
      const message = await prisma.message.create({
        data: { content, sender, room }
      });
      // include clientId (if provided) so client can dedupe optimistic messages
      const payload = { ...message, clientId };
      io.to(room).emit('new-message', payload);
    } catch (err) {
      console.error('Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

httpServer.listen(PORT, () => {
  console.log(`Socket server listening on http://localhost:${PORT}${io.path()}`);
});

process.on('SIGINT', async () => {
  console.log('Shutting down socket server...');
  await prisma.$disconnect();
  process.exit(0);
});
