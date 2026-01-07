#!/bin/bash

# 🚀 Khalafiati Deployment Script
# This script deploys the project to your server
# Usage: ./deploy-to-server.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Server details
SERVER_IP="31.97.158.25"
SERVER_USER="root"
SERVER_PATH="/var/www/khalafiati"

echo -e "${GREEN}🚀 Starting Khalafiati Deployment${NC}\n"

# Step 1: Build Frontend
echo -e "${YELLOW}📦 Building Frontend...${NC}"
cd frontend
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}\n"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi

cd ..

# Step 2: Create deployment package
echo -e "${YELLOW}📦 Creating deployment package...${NC}"
mkdir -p deployment-package
cp -r backend deployment-package/
cp -r frontend/dist deployment-package/frontend-dist

echo -e "${GREEN}✅ Package created${NC}\n"

# Step 3: Upload to server
echo -e "${YELLOW}📤 Uploading to server...${NC}"

# Upload backend
echo "Uploading backend..."
rsync -avz --progress deployment-package/backend/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/backend/

# Upload frontend
echo "Uploading frontend..."
rsync -avz --progress deployment-package/frontend-dist/ ${SERVER_USER}@${SERVER_IP}:${SERVER_PATH}/frontend-dist/

echo -e "${GREEN}✅ Files uploaded${NC}\n"

# Step 4: Install dependencies and restart on server
echo -e "${YELLOW}⚙️  Installing dependencies on server...${NC}"

ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /var/www/khalafiati/backend
npm install --production
pm2 restart khalafiati-api || pm2 start ecosystem.config.js
pm2 save
ENDSSH

echo -e "${GREEN}✅ Backend restarted${NC}\n"

# Step 5: Test deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
sleep 3

# Test API health
API_RESPONSE=$(curl -s https://api.khalafiati.srv1106665.hstgr.cloud/api/health)
if [[ $API_RESPONSE == *"success"* ]]; then
    echo -e "${GREEN}✅ API is healthy${NC}"
else
    echo -e "${RED}⚠️  API health check failed${NC}"
fi

# Cleanup
echo -e "${YELLOW}🧹 Cleaning up...${NC}"
rm -rf deployment-package
echo -e "${GREEN}✅ Cleanup done${NC}\n"

# Done
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"

echo "🌐 Frontend: https://khalafiati.srv1106665.hstgr.cloud"
echo "🔌 API:      https://api.khalafiati.srv1106665.hstgr.cloud/api"
echo ""
echo "📊 Check status: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "📝 View logs:    ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs khalafiati-api'"
