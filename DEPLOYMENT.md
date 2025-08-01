# Portfolio Snapshot Tool - Deployment Guide

## **Architecture Overview**

This project supports multiple deployment modes:

### **Development Mode (Local)**
- Next.js app runs locally
- Workers run locally
- Redis runs in Docker
- Best for development and testing

### **Production Mode (Docker)**
- Next.js app in Docker container (port 3000)
- Workers in separate Docker container (no external ports)
- Redis in Docker container
- Best for production deployment

## **Deployment Options**

### **Option 1: Development Mode**

```bash
# Terminal 1: Start Redis only
bun run docker:dev

# Terminal 2: Start Next.js app
bun run dev

# Terminal 3: Start workers locally
bun run worker:local
```

### **Option 2: Production Mode**

```bash
# Start all services in Docker
bun run docker:prod

# Stop all services
bun run docker:down
```

### **Option 3: Manual Docker**

```bash
# Development (Redis only)
docker-compose -f docker-compose.dev.yml up -d

# Production (Full setup)
docker-compose -f docker-compose.production.yml up -d
```

## **Container Architecture**

### **Production Setup:**
```
User → Next.js Container (Port 3000)
         ↓
    PostgreSQL/Redis
         ↓
Worker Container (Internal)
```

### **Services:**
- **app**: Next.js frontend + backend (port 3000)
- **worker**: Worker processes (no external ports)
- **redis**: Job queue management
- **cleanup**: Automatic job cleanup

## **Environment Variables**

Create a `.env` file with:
```env
DATABASE_URL=your-neon-database-url
REDIS_URL=redis://redis:6379
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## **Testing**

1. **Access the app**: `http://localhost:3000/ai-test`
2. **Submit URLs**: Add 2-3 different websites
3. **Monitor jobs**: Watch real-time job processing
4. **Check results**: Download generated snapshots

## **Troubleshooting**

### **Worker Issues:**
```bash
# Check worker logs
docker-compose -f docker-compose.production.yml logs worker

# Restart workers
docker-compose -f docker-compose.production.yml restart worker
```

### **Database Issues:**
```bash
# Check database connection
docker-compose -f docker-compose.production.yml exec worker bun run prisma db pull
```

### **Redis Issues:**
```bash
# Clear Redis queue
docker-compose -f docker-compose.production.yml exec redis redis-cli FLUSHALL
```

## **Scaling**

### **Add More Workers:**
```bash
# Scale worker service
docker-compose -f docker-compose.production.yml up -d --scale worker=3
```

### **Monitor Performance:**
```bash
# Check container status
docker-compose -f docker-compose.production.yml ps

# Check resource usage
docker stats
``` 