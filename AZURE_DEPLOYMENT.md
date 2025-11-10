# Azure App Service Deployment Guide

## Prerequisites
- Azure account with active subscription
- Azure CLI installed (`az` command)
- GitHub account with your repository
- Node.js 18+ (for local development)

## Step 1: Prepare for Azure Deployment

All files have been configured:
- ✅ `web.config`: IIS configuration for Azure App Service
- ✅ `.deployment`: Deployment configuration
- ✅ `deploy.sh`: Deployment script
- ✅ `package.json`: Build and start scripts ready

## Step 2: Create Azure Resources

### Option 1: Using Azure CLI (Recommended)

```powershell
# Login to Azure
az login

# Set your subscription
az account set --subscription "Your Subscription ID"

# Create a resource group
az group create `
  --name first-app-rg `
  --location "Southeast Asia"

# Create an App Service plan
az appservice plan create `
  --name first-app-plan `
  --resource-group first-app-rg `
  --sku B2 `
  --is-linux

# Create a web app
az webapp create `
  --resource-group first-app-rg `
  --plan first-app-plan `
  --name first-app-unique-name `
  --runtime "NODE|18-lts"

# Enable Web Socket support
az webapp config set `
  --resource-group first-app-rg `
  --name first-app-unique-name `
  --web-sockets-enabled true
```

### Option 2: Using Azure Portal (GUI)
1. Go to [portal.azure.com](https://portal.azure.com)
2. Create a new **App Service**
3. Select **Linux** as OS
4. Choose **Node.js 18 LTS** as runtime
5. Select appropriate pricing tier (B2 or higher recommended for Socket.IO)

## Step 3: Configure Deployment from GitHub

### Using Azure Portal:

1. Go to your App Service → **Deployment Center**
2. Select **GitHub** as source
3. Click **Authorize** and sign in to GitHub
4. Select your repository (`first-app`)
5. Select branch `main`
6. Click **Save**

Azure will automatically deploy whenever you push to the `main` branch.

### Using Azure CLI:

```powershell
# Connect GitHub repository to your web app
az webapp deployment github-actions add `
  --resource-group first-app-rg `
  --name first-app-unique-name `
  --repo thaibs080603-tech/first-app `
  --branch main `
  --token <your-github-token>
```

## Step 4: Set Environment Variables

### In Azure Portal:

1. Go to App Service → **Configuration**
2. Click **New application setting** and add:

| Name | Value | Notes |
|------|-------|-------|
| `DATABASE_URL` | `mysql://user:password@host:3306/db?sslaccept=strict` | Your Azure MySQL connection |
| `JWT_SECRET` | Generate a secure 32+ character string | See section below |
| `NEXT_PUBLIC_SOCKET_URL` | `https://your-app-name.azurewebsites.net` | Your App Service URL |
| `NODE_ENV` | `production` | Production environment |
| `PORT` | `8080` | Azure default port |

### Using Azure CLI:

```powershell
$appName = "first-app-unique-name"
$resourceGroup = "first-app-rg"

az webapp config appsettings set `
  --resource-group $resourceGroup `
  --name $appName `
  --settings `
    DATABASE_URL="mysql://user:password@host:3306/db?sslaccept=strict" `
    JWT_SECRET="your-secure-jwt-secret" `
    NEXT_PUBLIC_SOCKET_URL="https://$appName.azurewebsites.net" `
    NODE_ENV="production" `
    PORT="8080"
```

## Step 5: Generate Secure JWT_SECRET

Run this command to generate a secure random string:

```powershell
# PowerShell method
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Min 0 -Max 256)}))

# Or using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Copy the output and use it as your `JWT_SECRET` environment variable.

## Step 6: Enable WebSocket Support

WebSocket is required for Socket.IO. It's usually enabled by default on Azure App Service, but verify:

```powershell
az webapp config set `
  --resource-group first-app-rg `
  --name first-app-unique-name `
  --web-sockets-enabled true
```

## Step 7: Deploy and Test

### First Deployment:

1. Push code to GitHub `main` branch (or manually trigger deployment)
2. Go to App Service → **Deployment Center** → **Logs**
3. Wait for the deployment to complete (should take 2-5 minutes)
4. Once complete, your app will be live at `https://your-app-name.azurewebsites.net`

### Test Your Application:

1. Open `https://your-app-name.azurewebsites.net` in browser
2. Register a new account
3. Log in with your credentials
4. Send a test message
5. Open app in another tab/browser and log in
6. Verify real-time message sync with Socket.IO
7. Send message from second instance and verify it appears on first

### View Logs:

```powershell
# Stream logs in real-time
az webapp log tail `
  --resource-group first-app-rg `
  --name first-app-unique-name

# Or go to App Service → Log Stream in Azure Portal
```

## Step 8: Troubleshooting

### App doesn't start
```powershell
# Check deployment logs
az webapp deployment slot log download `
  --resource-group first-app-rg `
  --name first-app-unique-name `
  --log-file deployment.log
```

### Database connection fails
- Verify `DATABASE_URL` is correct
- Check Azure MySQL firewall rules allow App Service IP
- In MySQL: Run `az mysql server firewall-rule create` to allow Azure services

### Socket connection fails
- Verify `NEXT_PUBLIC_SOCKET_URL` matches your app URL
- Check WebSocket is enabled: `az webapp config show --resource-group first-app-rg --name first-app-unique-name | grep webSocketsEnabled`
- Check browser console (F12) for connection errors

### Out of memory errors
- Increase App Service Plan tier to B3 or higher
- Consider using Azure Container Registry for better performance

## Quick Reference: Common Commands

```powershell
# View app status
az webapp show --resource-group first-app-rg --name first-app-unique-name

# Restart app
az webapp restart --resource-group first-app-rg --name first-app-unique-name

# Stream logs
az webapp log tail --resource-group first-app-rg --name first-app-unique-name

# Update environment variables
az webapp config appsettings set `
  --resource-group first-app-rg `
  --name first-app-unique-name `
  --settings JWT_SECRET="new-value"

# Delete resources (cleanup)
az group delete --name first-app-rg --yes
```

## Post-Deployment Checklist

- [ ] App Service created and running
- [ ] GitHub integration configured
- [ ] Environment variables set (DATABASE_URL, JWT_SECRET, NEXT_PUBLIC_SOCKET_URL)
- [ ] WebSocket enabled
- [ ] MySQL database accessible from App Service
- [ ] First deployment completed successfully
- [ ] App loads without errors
- [ ] User registration works
- [ ] User login works
- [ ] Real-time messaging works with Socket.IO

## Documentation Links

- [Azure App Service Docs](https://docs.microsoft.com/en-us/azure/app-service/)
- [Deploy Node.js to Azure](https://docs.microsoft.com/en-us/azure/app-service/app-service-web-get-started-nodejs)
- [Azure CLI Reference](https://docs.microsoft.com/en-us/cli/azure/)
- [Next.js Deployment](https://nextjs.org/docs/deployment/static-exports)
- [Socket.IO Deployment Guide](https://socket.io/docs/v4/deployment/)

## Support

For issues or questions:
1. Check Azure Portal → Your App Service → Diagnose and solve problems
2. Review logs: App Service → Log Stream
3. Check Application Insights (if enabled)
4. Contact Azure Support for infrastructure issues
