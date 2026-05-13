#!/bin/bash
# 🚀 Beauty Parlour - Production Deployment Script
# This script automates the deployment to Render (Backend) and Firebase (Frontend)

set -e

echo "🚀 Beauty Parlour Production Deployment"
echo "========================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Step 1: Verify Git Status
echo -e "${BLUE}Step 1: Checking Git Status${NC}"
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Uncommitted changes detected:${NC}"
    git status --short
    echo -e "${YELLOW}Please commit all changes before deploying.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Repository clean${NC}"
echo ""

# Step 2: Build Backend
echo -e "${BLUE}Step 2: Building Backend${NC}"
cd backend
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 3: Build Frontend
echo -e "${BLUE}Step 3: Building Frontend for Production${NC}"
cd beauty-parlour
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build successful${NC}"
else
    echo -e "${RED}❌ Frontend build failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 4: Deploy Backend
echo -e "${BLUE}Step 4: Deploying Backend to Render${NC}"
echo -e "${YELLOW}Note: Render will auto-deploy when you push to main${NC}"
git push origin main
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend pushed to Render${NC}"
    echo -e "${YELLOW}Monitor deployment at: https://dashboard.render.com${NC}"
else
    echo -e "${RED}❌ Push to Render failed${NC}"
    exit 1
fi
echo ""

# Step 5: Deploy Frontend
echo -e "${BLUE}Step 5: Deploying Frontend to Firebase${NC}"
cd beauty-parlour
firebase deploy --only hosting
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend deployed to Firebase${NC}"
    echo -e "${YELLOW}Visit: https://beauty-parlour-0124.web.app${NC}"
else
    echo -e "${RED}❌ Firebase deployment failed${NC}"
    exit 1
fi
cd ..
echo ""

# Step 6: Verify Deployment
echo -e "${BLUE}Step 6: Verifying Deployment${NC}"
echo -e "${YELLOW}Waiting 30 seconds for services to be ready...${NC}"
sleep 30

# Test backend health
echo "Testing backend health..."
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://beauty-parlour-application.onrender.com/api/health)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check passed${NC}"
else
    echo -e "${YELLOW}⚠️  Backend health check returned: $HEALTH_RESPONSE (may still be initializing)${NC}"
fi

# Test frontend
echo "Testing frontend..."
FRONTEND_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" https://beauty-parlour-0124.web.app)
if [ "$FRONTEND_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✅ Frontend is accessible${NC}"
else
    echo -e "${RED}❌ Frontend returned: $FRONTEND_RESPONSE${NC}"
fi
echo ""

# Final Summary
echo -e "${GREEN}========================================"
echo "🎉 Deployment Complete!"
echo "========================================${NC}"
echo ""
echo "Your Beauty Parlour application is now live:"
echo ""
echo -e "${BLUE}Frontend:${NC} https://beauty-parlour-0124.web.app"
echo -e "${BLUE}Backend API:${NC} https://beauty-parlour-application.onrender.com/api"
echo -e "${BLUE}API Docs:${NC} https://beauty-parlour-application.onrender.com/api/docs"
echo ""
echo "Next Steps:"
echo "1. Visit the frontend and login"
echo "2. Test browsing services and products"
echo "3. Test booking an appointment"
echo "4. Monitor logs for any errors"
echo ""
echo "Dashboard Links:"
echo "- Render: https://dashboard.render.com"
echo "- Firebase: https://console.firebase.google.com"
echo ""
