# Deploying `first-app` to Vercel

Short answer: You can host the Next.js frontend on Vercel easily, but the Socket.IO server (server/socket-server.js) cannot run as a persistent WebSocket server on Vercel. You must either:

1. Deploy the Next.js app to Vercel and host the Socket.IO server separately (Azure App Service, DigitalOcean, Railway, Render, etc.) and then point `NEXT_PUBLIC_SOCKET_URL` to that server; OR
2. Replace the Socket.IO server with a managed realtime service (Pusher, Ably, Supabase Realtime) and update your client to use that service.

What I added:
- `vercel.json` — basic config for Vercel (Next.js build)
- `.vercelignore` — excludes the `server/` socket implementation and Azure files from Vercel deploy
- `.env.vercel` — template of environment variables to set in Vercel dashboard

Steps to deploy Next.js site to Vercel (frontend only)

1. Go to https://vercel.com and sign in with GitHub
2. Click "New Project" → Import `thaibs080603-tech/first-app`
3. Vercel will auto-detect Next.js. Click "Deploy".
4. After first deploy, open Project Settings → Environment Variables, and add:
   - `DATABASE_URL` = your database connection string (if you want server-side DB calls on Vercel)
   - `JWT_SECRET` = your JWT secret
   - `NEXT_PUBLIC_SOCKET_URL` = the public URL of your socket server (if hosted elsewhere)
   - `NODE_ENV` = `production`

Notes about the Socket.IO server

- Vercel serverless functions are not suitable for a stateful, long-lived WebSocket server.
- Recommended approaches:
  - Deploy `server/socket-server.js` to an App Service on Azure (we already prepared Azure files earlier) and set `NEXT_PUBLIC_SOCKET_URL` to `https://<your-azure-app>.azurewebsites.net`.
  - Or deploy the socket server to a VPS or container platform (DigitalOcean App Platform, Render, Railway paid plan, etc.).
  - Or replace with a managed realtime provider like Pusher or Ably for simpler scaling on Vercel.

Testing locally

- To test Vercel frontend with local socket server, set in `.env`:
  - `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`
- Run socket server locally: `npm run start-socket`
- Run Next.js locally: `npm run dev`

Deploy frontend + separate socket server example

1. Deploy frontend to Vercel (as above).
2. Deploy socket server to Azure App Service using `AZURE_PORTAL_QUICKSTART.md`.
3. Set `NEXT_PUBLIC_SOCKET_URL` in Vercel Environment Variables to the Azure app URL.
4. Push code to GitHub — Vercel will redeploy automatically.

If you want, I can:
- Create a small repository for just the socket server and help deploy it to Azure App Service (or Render) and provide the URL to set in Vercel; OR
- Help migrate the realtime piece to Pusher/Ably and update the client code.

Choose which approach you prefer and I will continue with concrete steps.
