# 🚀 ProCV Cloud Deployment Guide

This guide will help you deploy the ProCV chat server to production cloud infrastructure.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ Node.js 18+ installed
- ✅ npm or bun package manager
- ✅ Git configured
- ✅ A cloud platform account (Railway, Heroku, or Render)

## 🌐 Platform Options

### Option 1: Railway (Recommended) ⭐

**Why Railway?**
- ✅ Automatic PostgreSQL and Redis integration
- ✅ Auto-scaling and zero-downtime deployments
- ✅ Simple CLI and web interface
- ✅ Generous free tier
- ✅ Built-in SSL and custom domains

**Cost**: ~$5/month for starter (includes PostgreSQL + Redis)

### Option 2: Heroku

**Pros**: Mature platform, extensive documentation
**Cons**: More expensive (~$31/month for PostgreSQL + Redis + dyno)

### Option 3: Render

**Pros**: Free tier available, good performance
**Cons**: Manual setup required, limited database options

---

## 🚀 Quick Deploy to Railway

### Step 1: Install Railway CLI

```bash
# Using npm
npm install -g @railway/cli

# Using curl (alternative)
curl -fsSL https://railway.app/install.sh | sh
```

### Step 2: Login to Railway

```bash
railway login
```

### Step 3: Deploy Using Our Script

```bash
cd property-cv/chat-server
./deploy.sh --platform railway
```

That's it! 🎉 The script will:
- ✅ Install dependencies
- ✅ Validate configuration
- ✅ Create PostgreSQL and Redis services
- ✅ Deploy the application
- ✅ Provide you with the production URL

### Step 4: Update Frontend Configuration

Once deployed, update your frontend environment variables:

```bash
# In property-cv/.env.local
NEXT_PUBLIC_CHAT_SERVER_URL=https://your-railway-url.railway.app
```

---

## 📖 Manual Deployment Steps

If you prefer manual deployment or the script doesn't work:

### Railway Manual Steps

1. **Create Railway Project**
   ```bash
   cd property-cv/chat-server
   railway init
   ```

2. **Add Database Services**
   ```bash
   railway add postgresql
   railway add redis
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set NODE_ENV=production
   railway variables set PORT=8080
   railway variables set JWT_SECRET=$(openssl rand -base64 32)
   railway variables set CORS_ORIGIN=https://your-frontend-domain.com
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Your URL**
   ```bash
   railway status
   ```

### Heroku Manual Steps

1. **Install Heroku CLI**: https://devcenter.heroku.com/articles/heroku-cli

2. **Create App**
   ```bash
   cd property-cv/chat-server
   heroku create procv-chat-server
   ```

3. **Add Addons**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   heroku addons:create heroku-redis:mini
   ```

4. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=$(openssl rand -base64 32)
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
   ```

5. **Deploy**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

---

## 🔧 Configuration

### Required Environment Variables

```bash
# Core Configuration
NODE_ENV=production
PORT=8080
JWT_SECRET=your_secure_random_jwt_secret_here

# CORS - Update with your domains
CORS_ORIGIN=https://your-frontend.netlify.app,https://procv.cv

# Database (auto-populated by cloud providers)
DATABASE_URL=$DATABASE_URL
REDIS_URL=$REDIS_URL

# Optional Performance Tuning
WS_MAX_CONNECTIONS_PER_USER=5
RATE_LIMIT_MAX_REQUESTS=1000
LOG_LEVEL=info
```

### Security Checklist

- [ ] Strong JWT secret (use `openssl rand -base64 32`)
- [ ] CORS origins restricted to your domains only
- [ ] SSL/HTTPS enabled (auto on Railway/Heroku)
- [ ] Environment variables secured
- [ ] Database passwords rotated from defaults

---

## 🔍 Testing Your Deployment

### 1. Health Check

```bash
curl https://your-app-url.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-07-30T17:47:33.840Z",
  "uptime": 123.45,
  "connections": {
    "active": 0,
    "activeUsers": 0
  }
}
```

### 2. WebSocket Test

```javascript
// Test in browser console
const socket = io('https://your-app-url.railway.app', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('✅ Connected to production server!');
});

socket.on('connect_error', (error) => {
  console.log('❌ Connection failed:', error);
});
```

### 3. Frontend Integration Test

Update your frontend `.env.local`:

```bash
NEXT_PUBLIC_CHAT_SERVER_URL=https://your-app-url.railway.app
```

Then test the chat functionality in your frontend.

---

## 📊 Monitoring & Maintenance

### Application Monitoring

1. **Railway Dashboard**: https://railway.app/dashboard
   - View logs, metrics, and deployments
   - Monitor resource usage
   - Set up alerts

2. **Health Monitoring**
   ```bash
   # Check health endpoint
   curl https://your-app-url.railway.app/health

   # View metrics
   curl https://your-app-url.railway.app/metrics
   ```

3. **Log Monitoring**
   ```bash
   # Railway logs
   railway logs --tail

   # Heroku logs
   heroku logs --tail
   ```

### Database Maintenance

1. **Backup Strategy**
   - Railway: Automatic daily backups
   - Heroku: `heroku pg:backups:capture`

2. **Performance Monitoring**
   - Monitor connection pools
   - Watch for slow queries
   - Set up database alerts

### Scaling Considerations

1. **Horizontal Scaling**
   ```bash
   # Railway (auto-scaling available)
   railway up --replicas 3

   # Heroku
   heroku ps:scale web=3
   ```

2. **Vertical Scaling**
   - Upgrade to higher memory/CPU tiers
   - Monitor resource usage first

---

## 🚨 Troubleshooting

### Common Issues

1. **"Cannot connect to server"**
   - ✅ Check CORS_ORIGIN includes your frontend domain
   - ✅ Verify SSL/HTTPS configuration
   - ✅ Test health endpoint directly

2. **"Authentication failed"**
   - ✅ Ensure JWT_SECRET is set correctly
   - ✅ Check token generation on frontend
   - ✅ Verify token expiration settings

3. **"Database connection failed"**
   - ✅ Check DATABASE_URL environment variable
   - ✅ Verify database service is running
   - ✅ Test database connectivity

4. **"Too many connections"**
   - ✅ Check WS_MAX_CONNECTIONS_PER_USER setting
   - ✅ Monitor active connections
   - ✅ Consider scaling horizontally

### Getting Help

1. **Check Application Logs**
   ```bash
   railway logs --tail  # or heroku logs --tail
   ```

2. **Database Logs**
   ```bash
   railway logs --service postgresql
   ```

3. **Contact Support**
   - Railway: https://railway.app/help
   - Heroku: https://help.heroku.com
   - ProCV Team: support@procv.cv

---

## 📈 Performance Optimization

### Production Optimizations

1. **Enable Compression**
   - ✅ Already enabled in server.js
   - Uses gzip compression for responses

2. **Connection Pooling**
   - ✅ Configured for PostgreSQL
   - Optimized for cloud environments

3. **Rate Limiting**
   - ✅ Protects against abuse
   - Configurable per environment

4. **Graceful Shutdown**
   - ✅ Handles SIGTERM signals
   - Prevents data loss during deployments

### Monitoring Metrics

Key metrics to watch:
- Response time (< 200ms target)
- Active WebSocket connections
- Memory usage (< 80% of allocated)
- Database connection pool usage
- Error rates (< 0.1% target)

---

## 🌍 Global Deployment

### CDN and Edge Optimization

1. **Railway Global Edge**
   - Automatic edge deployment
   - Global request routing

2. **Custom Domain Setup**
   ```bash
   # Railway
   railway domain add your-domain.com

   # Heroku
   heroku domains:add your-domain.com
   ```

3. **SSL Certificate**
   - Automatic SSL on Railway/Heroku
   - Custom certificates supported

---

## 💰 Cost Optimization

### Railway Pricing

- **Starter**: $5/month (500GB bandwidth, 8GB RAM, PostgreSQL + Redis)
- **Pro**: $20/month (1TB bandwidth, flexible resources)

### Heroku Pricing

- **Basic Dyno**: $7/month
- **PostgreSQL Essential**: $9/month
- **Redis Mini**: $15/month
- **Total**: ~$31/month

### Cost Saving Tips

1. **Use Railway for better value**
2. **Monitor resource usage**
3. **Implement efficient caching**
4. **Optimize database queries**
5. **Use connection pooling**

---

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain** 🌐
   - Set up your procv.cv domain
   - Configure DNS records
   - Enable SSL certificates

2. **Email Integration** 📧
   - Set up transactional emails
   - Configure SMTP settings
   - Add email notifications

3. **Real-time Analytics** 📊
   - Implement user analytics
   - Add performance monitoring
   - Set up error tracking

4. **Payment Processing** 💳
   - Enable live Stripe environment
   - Configure webhooks
   - Add payment notifications

5. **Mobile App** 📱
   - Convert PWA to native app
   - Deploy to app stores
   - Add push notifications

---

**🎉 Congratulations!** Your ProCV chat server is now running in production. Your real estate platform is ready to serve users across Cape Verde and beyond!

For additional support or custom deployment needs, contact the ProCV development team.
