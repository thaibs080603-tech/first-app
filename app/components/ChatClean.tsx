'use client';

import React, { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import styles from './chat.module.css';

interface Message {
  id: number;
  content: string;
  sender: string;
  room: string;
  createdAt: string;
  clientId?: string;
}

export default function Chat() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [room, setRoom] = useState('general');
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const messagesRef = useRef<HTMLDivElement | null>(null);

  // connect socket when we are authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    let socketInstance: Socket | null = null;

    (async () => {
      try {
        // Exchange our HttpOnly cookie for a short-lived socket token
        const res = await fetch('/api/auth/socket-token', { credentials: 'include' });
        if (!res.ok) {
          // no token available (not authenticated on server side) - do not crash
          console.warn('no token from /api/auth/socket-token', res.status);
          return;
        }
        const data = await res.json();
        const token = data?.token;
        if (!token) {
          console.warn('socket-token endpoint returned no token');
          return;
        }
        if (cancelled) return;

        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        socketInstance = io(socketUrl, {
          path: '/api/socket',
          transports: ['websocket'],
          auth: { token },
        });

        socketInstance.on('connect', () => {
          setIsConnected(true);
          socketInstance?.emit('join-room', room);
        });

        socketInstance.on('disconnect', () => {
          setIsConnected(false);
        });

        socketInstance.on('new-message', (newMessage: Message) => {
          if (newMessage.clientId) {
            setMessages((prev) => {
              const idx = prev.findIndex((m) => m.clientId === newMessage.clientId);
              if (idx !== -1) {
                const copy = [...prev];
                copy[idx] = newMessage;
                return copy;
              }
              return [...prev, newMessage];
            });
          } else {
            setMessages((prev) => [...prev, newMessage]);
          }
        });

        setSocket(socketInstance);

        // load recent history once connected
        fetch(`/api/messages?room=${encodeURIComponent(room)}`)
          .then((r) => r.json())
          .then((data: Message[]) => setMessages(data))
          .catch((e) => console.error('Failed to load messages', e));
      } catch (err) {
        console.error('Socket setup failed', err);
      }
    })();

    return () => {
      cancelled = true;
      if (socketInstance) socketInstance.disconnect();
    };
  // we intentionally only re-run when authentication changes (reconnect on login)
  }, [isAuthenticated]);

  // when room changes, ask server to join and reload history
  useEffect(() => {
    if (!socket || !username) return;
    socket.emit('join-room', room);
    fetch(`/api/messages?room=${encodeURIComponent(room)}`)
      .then((r) => r.json())
      .then((data: Message[]) => setMessages(data))
      .catch((e) => console.error('Failed to load messages', e));
  }, [room, socket, username]);

  // auto-scroll to bottom on new messages
  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  const handleRegister = async () => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error('register failed');
      // on successful register, switch to login mode to sign in
      setAuthMode('login');
      alert('Registered. Please login.');
    } catch (err) {
      console.error(err);
      alert('Registration failed');
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('login failed');
      // login sets an HttpOnly cookie; mark authenticated so socket connects
      setPassword('');
      setIsAuthenticated(true);
    } catch (err) {
      console.error(err);
      alert('Login failed');
    }
  };

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (socket && message && username) {
      const clientId = `${Date.now()}-${Math.floor(Math.random() * 100000)}`;
      socket.emit('send-message', {
        content: message,
        sender: username,
        room,
        clientId,
      });
      const optimistic: Message = {
        id: Date.now(),
        content: message,
        sender: username,
        room,
        createdAt: new Date().toISOString(),
        clientId,
      };
      setMessages((prev) => [...prev, optimistic]);
      setMessage('');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.status}>Socket: {isConnected ? 'connected' : 'disconnected'}</div>

      {!isAuthenticated ? (
        <div className={styles.usernameForm}>
          <h3>{authMode === 'login' ? 'Login' : 'Register'}</h3>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={styles.input}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={styles.input}
          />
          {authMode === 'login' ? (
            <>
              <button onClick={handleLogin} className={styles.button}>Login</button>
              <p>
                Don't have an account?{' '}
                <button onClick={() => setAuthMode('register')} className={styles.linkButton}>Register</button>
              </p>
            </>
          ) : (
            <>
              <button onClick={handleRegister} className={styles.button}>Register</button>
              <p>
                Already have an account?{' '}
                <button onClick={() => setAuthMode('login')} className={styles.linkButton}>Login</button>
              </p>
            </>
          )}
        </div>
      ) : (
        <div className={styles.chatContainer}>
          <div className={styles.header}>
            <h2>Chat Room: {room}</h2>
            <select value={room} onChange={(e) => setRoom(e.target.value)} className={styles.select}>
              <option value="general">General</option>
              <option value="random">Random</option>
              <option value="support">Support</option>
            </select>
          </div>

          <div className={styles.messages} ref={messagesRef}>
            {messages.map((msg) => (
              <div
                key={msg.clientId ?? msg.id}
                className={`${styles.message} ${msg.sender === username ? styles.ownMessage : ''}`}
              >
                <strong>{msg.sender}:</strong> {msg.content}
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className={styles.inputForm}>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message..."
              className={styles.messageInput}
            />
            <button type="submit" className={styles.button}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
