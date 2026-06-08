# 🚀 Railway Deployment Guide - ProCV Chat Server

Deploy your ProCV chat server to Railway cloud platform in under 10 minutes!

## 🎯 What You'll Deploy

- ✅ **Production WebSocket Server** - Real-time chat infrastructure
- ✅ **PostgreSQL Database** - Cloud database with backups
- ✅ **Redis Cache** - Session management and caching
- ✅ **Auto-scaling** - Handles traffic spikes automatically
- ✅ **SSL/HTTPS** - Secure connections included
- ✅ **Health Monitoring** - Built-in application monitoring

## 📋 Prerequisites

- ✅ Railway account (free): https://railway.app
- ✅ Git repository with ProCV code
- ✅ Terminal/command line access

## 🚀 Option 1: Automated Deployment (Recommended)

### Step 1: Install Railway CLI

```bash
# Option A: Using npm
npm install -g @railway/cli

# Option B: Using curl (if npm fails)
curl -fsSL https://railway.app/install.sh | sh
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Deploy with Our Script

```bash
cd property-cv/chat-server
chmod +x deploy.sh
./deploy.sh --platform railway
```

**That's it!** 🎉 The script will:
- ✅ Validate your code
- ✅ Create Railway project
- ✅ Add PostgreSQL and Redis
- ✅ Set environment variables
- ✅ Deploy your application
- ✅ Provide production URL

---

## 🔧 Option 2: Manual Deployment

### Step 1: Create Railway Project

```bash
cd property-cv/chat-server
railway init
```

Choose: **"Empty Project"**

### Step 2: Add Database Services

```bash
# Add PostgreSQL database
railway add postgresql

# Add Redis cache
railway add redis
```

### Step 3: Set Environment Variables

```bash
# Core configuration
railway variables set NODE_ENV=production
railway variables set PORT=8080

# Security (generate strong JWT secret)
railway variables set JWT_SECRET=$(openssl rand -base64 32)

# CORS (update with your domain)
railway variables set CORS_ORIGIN=https://your-frontend-domain.netlify.app,https://procv.cv

# Optional: Stripe configuration
railway variables set STRIPE_SECRET_KEY=sk_live_your_stripe_key_here
```

### Step 4: Deploy Application

```bash
railway up
```

### Step 5: Get Your Production URL

```bash
# Check deployment status
railway status

# Get the public URL
railway domain
```

---

## 🔗 Frontend Integration

### Update Frontend Environment

Once deployed, update your frontend environment variables:

```bash
# In property-cv/.env.local
NEXT_PUBLIC_CHAT_SERVER_URL=https://your-app-name.up.railway.app
```

### Test Connection

Test your WebSocket connection:

```javascript
// Test in browser console
const socket = io('https://your-app-name.up.railway.app', {
  auth: { token: 'test-token' }
});

socket.on('connect', () => {
  console.log('✅ Connected to production chat server!');
});
```

---

## 🔒 Security Configuration

### Essential Environment Variables

```bash
# Required for production
NODE_ENV=production
PORT=8080
JWT_SECRET=your_super_secure_jwt_secret_here

# CORS protection
CORS_ORIGIN=https://procv.cv,https://your-domain.com

# Rate limiting
RATE_LIMIT_MAX_REQUESTS=1000
WS_MAX_CONNECTIONS_PER_USER=5

# Logging
LOG_LEVEL=info
```

### Generate Secure JWT Secret

```bash
# Generate a secure 64-character random string
openssl rand -base64 64

# Example output:
# k8hY2nP9vQ4mR7tA6sL3jH5fG8dS1wE9rU0yI2oK4vN7bM3zX6cQ1pL5tA8hY2nP
```

---

## 📊 Monitoring & Health Checks

### Health Check Endpoint

Your deployed app includes health monitoring:

```bash
# Check application health
curl https://your-app-name.up.railway.app/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-07-30T17:47:33.840Z",
  "uptime": 123.45,
  "activeConnections": 0,
  "environment": "production"
}
```

### Metrics Endpoint

```bash
# Get application metrics
curl https://your-app-name.up.railway.app/metrics

# Response includes:
# - Memory usage
# - Active connections
# - Database status
# - Redis status
```

### View Logs

```bash
# Real-time logs
railway logs --tail

# Filter by service
railway logs --service postgresql
railway logs --service redis
```

---

## 📈 Scaling & Performance

### Auto-scaling Configuration

Railway automatically scales your application based on:
- **CPU usage** (scales up at 80% CPU)
- **Memory usage** (scales up at 80% memory)
- **Request volume** (adds instances for high traffic)

### Manual Scaling

```bash
# Scale to specific number of instances
railway up --replicas 3

# Scale based on resource limits
railway variables set RAILWAY_REPLICA_COUNT=2
```

### Performance Monitoring

Monitor your app in Railway dashboard:
1. Go to https://railway.app/dashboard
2. Select your project
3. View metrics:
   - CPU usage
   - Memory usage
   - Network traffic
   - Response times

---

## 💰 Pricing & Costs

### Railway Pricing (2024)

- **Starter Plan**: $5/month
  - 500GB bandwidth
  - 8GB RAM per service
  - PostgreSQL included
  - Redis included
  - Custom domains
  - SSL certificates

- **Pro Plan**: $20/month
  - 1TB bandwidth
  - Flexible resources
  - Priority support
  - Advanced metrics

### Cost Optimization Tips

```bash
# Monitor resource usage
railway metrics

# Optimize memory usage
railway variables set MAX_MEMORY_USAGE=512

# Set appropriate connection limits
railway variables set WS_MAX_CONNECTIONS_PER_USER=3
```

---

## 🛠️ Troubleshooting

### Common Issues

**1. Deployment Fails**
```bash
# Check Railway CLI version
railway --version

# Update CLI
npm update -g @railway/cli

# Retry deployment
railway up --force
```

**2. Database Connection Issues**
```bash
# Check database status
railway logs --service postgresql

# Verify connection string
railway variables get DATABASE_URL
```

**3. WebSocket Connection Fails**
```bash
# Check CORS configuration
railway variables get CORS_ORIGIN

# View application logs
railway logs --tail
```

**4. High Memory Usage**
```bash
# Monitor memory
railway metrics

# Restart services
railway restart
```

### Getting Help

1. **Railway Documentation**: https://docs.railway.app
2. **Railway Discord**: https://discord.gg/railway
3. **Railway Support**: support@railway.app

---

## ✅ Deployment Checklist

### Pre-deployment
- [ ] ✅ Railway account created
- [ ] ✅ Railway CLI installed
- [ ] ✅ Code tested locally
- [ ] ✅ Environment variables prepared

### During Deployment
- [ ] ✅ Project created successfully
- [ ] ✅ PostgreSQL database added
- [ ] ✅ Redis cache added
- [ ] ✅ Environment variables set
- [ ] ✅ Application deployed

### Post-deployment
- [ ] ✅ Health check passes
- [ ] ✅ WebSocket connections work
- [ ] ✅ Frontend connected to production
- [ ] ✅ Logs show no errors
- [ ] ✅ SSL certificate active

---

## 🌍 Custom Domain Setup (Optional)

### Add Custom Domain

```bash
# Add your custom domain
railway domain add chat.procv.cv

# Railway will provide DNS instructions
```

### DNS Configuration

Add these DNS records to your domain:

```
Type: CNAME
Name: chat
Value: your-app-name.up.railway.app
```

### SSL Certificate

Railway automatically provides SSL certificates for custom domains.

---

## 🎉 Success!

Your ProCV chat server is now live on Railway!

**Production URL**: `https://your-app-name.up.railway.app`

### Next Steps

1. **Update Frontend**: Connect your frontend to production WebSocket URL
2. **Test Features**: Verify all chat features work in production
3. **Monitor Performance**: Watch metrics and logs
4. **Set Up Alerts**: Configure notifications for issues
5. **Custom Domain**: Add your procv.cv domain (optional)

---

**Need help?** Check the troubleshooting section or contact support at support@procv.cv
