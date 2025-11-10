import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';
import { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

let io: SocketIOServer | undefined;

if (!io) {
  const httpServer = createServer();
  io = new SocketIOServer(httpServer, {
    path: '/api/socket',
    addTrailingSlash: false,
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Join a room
    socket.on('join-room', (room) => {
      socket.join(room);
      console.log(`User ${socket.id} joined room: ${room}`);
    });

    // Leave a room
    socket.on('leave-room', (room) => {
      socket.leave(room);
      console.log(`User ${socket.id} left room: ${room}`);
    });

    // Handle new message
    socket.on('send-message', async ({ content, sender, room }) => {
      try {
        // Save message to database
        const message = await prisma.message.create({
          data: {
            content,
            sender,
            room
          }
        });

        // Broadcast the message to the room
        io?.to(room).emit('new-message', message);
      } catch (error) {
        console.error('Error saving message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  httpServer.listen(3001);
}

export async function GET(request: Request) {
  return new NextResponse('Socket.IO server is running.', {
    status: 200,
  });
}

export async function POST(request: Request) {
  return new NextResponse('Socket.IO server is running.', {
    status: 200,
  });
}