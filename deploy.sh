#!/bin/bash

# Azure App Service deployment script for Next.js + Socket.IO

echo "Starting deployment..."

# Navigate to app root
cd /home/site/wwwroot

# Install dependencies
echo "Installing dependencies..."
npm install

# Generate Prisma client
echo "Generating Prisma client..."
npm run build

# Start the application
echo "Starting application..."
npm run start-all
