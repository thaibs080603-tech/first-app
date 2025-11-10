# Railway Deployment Guide

## Prerequisites
- GitHub account with your code repository
- Railway.app account

## Step 1: Prepare Your Repository

All changes have been made:
- ✅ `ChatClean.tsx`: Updated to use `NEXT_PUBLIC_SOCKET_URL` environment variable
- ✅ `railway.json`: Configuration for Railway build and deployment
- ✅ `package.json`: Added `start-all` script and `concurrently` dependency
- ✅ `.env.production`: Template for production environment variables

## Step 2: Commit and Push to GitHub

```powershell
git add .
git commit -m "chore: prepare for Railway deployment

- Update socket URL to use NEXT_PUBLIC_SOCKET_URL env var
- Add railway.json configuration
- Add start-all script to run Next.js and Socket server together
- Add concurrently to manage multiple processes
"
git push origin main
```

## Step 3: Deploy to Railway

### Method 1: Using Railway CLI (Recommended)
```powershell
npm install -g @railway/cli
railway link                    # Link to your Railway project
railway up                      # Deploy your project
```

### Method 2: Using Railway Dashboard (GUI)
1. Go to [railway.app](https://railway.app)
2. Sign in and go to Dashboard
3. Click "New Project"
4. Select "Deploy from GitHub"
5. Connect your GitHub account and select your repository
6. Railway will auto-detect and deploy

## Step 4: Set Environment Variables in Railway

After deployment starts, go to your Railway project and set these environment variables:

1. **DATABASE_URL** (already in `.env`, but verify):
   - Your Azure MySQL connection string
   - Format: `mysql://username:password@host:port/database?sslaccept=strict`

2. **JWT_SECRET** (IMPORTANT - change from placeholder):
   - Generate a secure random string:
     ```powershell
     # On Windows PowerShell:
     [Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Min 0 -Max 256)}))
     ```
   - Or use: `openssl rand -base64 32` (if you have OpenSSL installed)
   - Set a 32+ character random string

3. **NEXT_PUBLIC_SOCKET_URL**:
   - Once deployment is complete, Railway will give you a public URL
   - Set it to: `https://your-railway-domain.up.railway.app`
   - (Replace `your-railway-domain` with your actual Railway subdomain)

## Step 5: Verify Deployment

After environment variables are set and the deployment completes:

1. Open your Railway app URL in browser
2. Test registration (create new account)
3. Test login with registered credentials
4. Send a test message
5. Open the app in another browser tab (same or different browser)
6. Login to second instance and verify message appears in real-time
7. Send message from second instance and verify it appears on first

## Troubleshooting

### App doesn't start
- Check Railway logs: Go to "Logs" tab in Railway dashboard
- Verify all environment variables are set (especially `DATABASE_URL` and `JWT_SECRET`)
- Look for Prisma errors - you may need to run migrations on production database

### Socket connection fails
- Verify `NEXT_PUBLIC_SOCKET_URL` is set correctly in Railway
- Check that the URL matches your actual Railway app domain
- Look at browser console (F12) for connection errors
- Check socket server logs in Railway

### Database connection fails
- Verify `DATABASE_URL` is accessible from Railway's servers
- For Azure MySQL: Check firewall rules allow Railway's IP range (if using IP-based firewall)
- Test connection string locally first to confirm it works

### Messages don't persist
- Verify Prisma can connect to database
- Check that Prisma schema hasn't changed
- In Railway logs, look for any Prisma error messages

## Environment Variable Values Reference

| Variable | Example | Notes |
|----------|---------|-------|
| DATABASE_URL | `mysql://user:pass@host:3306/db?sslaccept=strict` | Your Azure MySQL connection |
| JWT_SECRET | `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6` | 32+ random characters - CHANGE from placeholder! |
| NEXT_PUBLIC_SOCKET_URL | `https://app.up.railway.app` | Your Railway public URL |
| SOCKET_PORT | `3001` | Optional - only if socket runs on different port |

## Local Development After Deployment

For local testing with production URL:
1. Update `.env` with production NEXT_PUBLIC_SOCKET_URL (optional)
2. Run: `npm install && npm run dev`
3. App will connect to production database and socket server

For local-only testing:
1. Keep `.env` with `NEXT_PUBLIC_SOCKET_URL=http://localhost:3001`
2. Run socket server: `npm run start-socket` (in one terminal)
3. Run Next.js: `npm run dev` (in another terminal)

## Documentation Links

- [Railway Docs](https://docs.railway.app)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Socket.IO Deployment](https://socket.io/docs/v4/deployment/)
