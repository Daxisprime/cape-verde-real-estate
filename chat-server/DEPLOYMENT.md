# ProCV Chat Server Deployment Guide

This guide covers deploying the ProCV Chat Server to production cloud infrastructure.

## 🚀 Deployment Options

### Option 1: Railway (Recommended)

Railway provides easy PostgreSQL and Redis integration with automatic scaling.

#### Prerequisites
1. Install Railway CLI: `npm install -g @railway/cli`
2. Create Railway account: https://railway.app
3. Login: `railway login`

#### Deployment Steps

1. **Initialize Railway Project**
   ```bash
   cd property-cv/chat-server
   railway init
   ```

2. **Add PostgreSQL Database**
   ```bash
   railway add postgresql
   ```

3. **Add Redis Cache**
   ```bash
   railway add redis
   ```

4. **Deploy Application**
   ```bash
   railway up
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your_production_jwt_secret_here
   railway variables set CORS_ORIGIN=https://procv.cv,https://your-domain.com
   ```

6. **Run Database Migrations**
   ```bash
   railway run npm run migrate
   railway run npm run seed
   ```

#### Production URL
After deployment, Railway will provide a URL like:
`https://procv-chat-server-production.up.railway.app`

### Option 2: Heroku

#### Prerequisites
1. Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
2. Create Heroku account: https://heroku.com
3. Login: `heroku login`

#### Deployment Steps

1. **Create Heroku App**
   ```bash
   cd property-cv/chat-server
   heroku create procv-chat-server
   ```

2. **Add Database and Redis**
   ```bash
   heroku addons:create heroku-postgresql:essential-0
   heroku addons:create heroku-redis:mini
   ```

3. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your_production_jwt_secret_here
   heroku config:set CORS_ORIGIN=https://procv.cv
   ```

4. **Deploy Application**
   ```bash
   git add .
   git commit -m "Deploy to Heroku"
   git push heroku main
   ```

5. **Run Database Setup**
   ```bash
   heroku run npm run migrate
   heroku run npm run seed
   ```

## 🔧 Environment Variables

### Required Variables
- `NODE_ENV`: production
- `JWT_SECRET`: Strong random secret for JWT tokens
- `DATABASE_URL`: PostgreSQL connection string (auto-set by cloud providers)
- `REDIS_URL`: Redis connection string (auto-set by cloud providers)

### Optional Variables
- `CORS_ORIGIN`: Comma-separated list of allowed origins
- `LOG_LEVEL`: info (default) | debug | warn | error
- `RATE_LIMIT_MAX_REQUESTS`: 100 (default)
- `WS_MAX_CONNECTIONS_PER_USER`: 5 (default)

### Stripe Integration (if enabled)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook endpoint secret

## 📊 Monitoring & Health Checks

### Health Check Endpoint
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "activeConnections": 42,
  "activeUsers": 15,
  "uptime": 3600
}
```

### Metrics Endpoint (Protected)
```
GET /metrics
```

### Logging
- All logs are structured JSON for easy parsing
- Log levels: error, warn, info, debug
- Use cloud provider log aggregation services

## 🔒 Security Considerations

### Environment Security
1. **JWT Secret**: Use a strong, random 64-character string
2. **Database**: Enable SSL connections in production
3. **Redis**: Use password authentication
4. **CORS**: Restrict to your domain(s) only

### Network Security
1. **HTTPS Only**: Ensure all traffic uses HTTPS
2. **Rate Limiting**: Configured for API endpoints
3. **WebSocket Security**: Origin validation enabled

### Database Security
1. **Connection Pooling**: Configured for production load
2. **Backup Strategy**: Enable automated backups
3. **SSL Mode**: Required for PostgreSQL connections

## 🚀 Performance Optimization

### Scaling Configuration
- **Railway**: Auto-scaling based on CPU/memory
- **Heroku**: Manual scaling with `heroku ps:scale web=2`

### Database Optimization
- Connection pooling: 10-20 connections max
- Query optimization for large datasets
- Indexing on frequently queried columns

### Redis Optimization
- Session storage for WebSocket connections
- Caching for frequently accessed data
- Pub/sub for multi-instance communication

## 🔄 CI/CD Integration

### GitHub Actions (Example)
```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
    paths: ['chat-server/**']

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Use Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      - name: Deploy to Railway
        run: railway up --detach
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

## 🧪 Testing Production Deployment

### Health Check
```bash
curl https://your-chat-server.railway.app/health
```

### WebSocket Connection Test
```javascript
const socket = io('https://your-chat-server.railway.app', {
  auth: { token: 'your-jwt-token' }
});

socket.on('connect', () => {
  console.log('Connected to production server!');
});
```

### Database Connection Test
```bash
# Railway
railway run npx sequelize-cli db:migrate:status

# Heroku
heroku run npx sequelize-cli db:migrate:status
```

## 📱 Frontend Integration

Update your frontend environment variables:

### Production Environment
```env
NEXT_PUBLIC_CHAT_SERVER_URL=https://your-chat-server.railway.app
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### Development Environment
```env
NEXT_PUBLIC_CHAT_SERVER_URL=http://localhost:8080
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Fails**
   - Check CORS_ORIGIN environment variable
   - Verify SSL certificate is valid
   - Check firewall/security group settings

2. **Database Connection Issues**
   - Verify DATABASE_URL is set correctly
   - Check database service status
   - Ensure SSL mode is configured

3. **High Memory Usage**
   - Monitor active WebSocket connections
   - Check for memory leaks in Node.js
   - Scale horizontally if needed

### Log Analysis
```bash
# Railway
railway logs --tail

# Heroku
heroku logs --tail --app procv-chat-server
```

## 🔄 Updates & Maintenance

### Rolling Updates
1. Deploy new version to staging
2. Run automated tests
3. Deploy to production with zero downtime
4. Monitor health metrics

### Database Migrations
```bash
# Test migration first
railway run npm run migrate:status

# Apply migrations
railway run npm run migrate

# Rollback if needed
railway run npx sequelize-cli db:migrate:undo
```

## 📊 Cost Optimization

### Railway Pricing
- Starter: $5/month per service
- PostgreSQL: Usage-based
- Redis: Usage-based

### Heroku Pricing
- Basic Dyno: $7/month
- PostgreSQL Essential: $9/month
- Redis Mini: $15/month

### Optimization Tips
1. Use connection pooling
2. Implement proper caching
3. Monitor resource usage
4. Scale based on actual demand

---

For more help, contact the development team or check the Railway/Heroku documentation.
