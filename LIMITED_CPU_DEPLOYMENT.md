# Limited CPU Server Deployment Guide

This guide is optimized for servers with **3 CPU cores and 4GB RAM** to prevent CPU throttling and ensure stable deployment.

## 🚨 Key Changes Made

### 1. **Resource Limits**
- **App Container**: 1.5 CPU cores max, 2GB RAM max
- **Worker Container**: 1.0 CPU core max, 1.5GB RAM max  
- **Cleanup Container**: 0.5 CPU cores max, 0.5GB RAM max

### 2. **Worker Optimization**
- Reduced from **3 workers to 1 worker** to prevent CPU competition
- Single Puppeteer instance with minimal resource usage
- Optimized Chromium flags for low CPU consumption

### 3. **Production Mode**
- Fixed development mode (`bun run dev` → `bun run start`)
- Proper NODE_ENV=production
- Memory limits for Node.js processes

## 🚀 Deployment Steps

### 1. **Environment Setup**
```bash
# Create .env file with your Redis URL
REDIS_URL=your_redis_connection_string
NODE_ENV=production
```

### 2. **Build and Deploy**
```bash
# Build the optimized containers
docker-compose -f docker-compose.production.yml build

# Start services with resource limits
docker-compose -f docker-compose.production.yml up -d
```

### 3. **Monitor Resource Usage**
```bash
# Check container resource usage
docker stats

# View logs for any issues
docker-compose -f docker-compose.production.yml logs -f
```

## 🔧 Performance Optimizations

### **Puppeteer Settings**
- `--single-process`: Single Chromium process
- `--disable-gpu`: No GPU acceleration
- `--disable-extensions`: No browser extensions
- `--disable-background-timer-throttling`: Prevent background throttling

### **Node.js Settings**
- `--max-old-space-size=512`: Limit heap memory to 512MB
- `--max-semi-space-size=64`: Limit semi-space to 64MB

### **Container Settings**
- CPU reservations ensure minimum resources
- Memory limits prevent OOM crashes
- Single worker prevents CPU competition

## 📊 Expected Resource Usage

| Service | CPU Usage | Memory Usage | Status |
|---------|-----------|--------------|---------|
| App     | 0.5-1.5   | 1-2GB        | ✅ Stable |
| Worker  | 0.3-1.0   | 0.8-1.5GB   | ✅ Stable |
| Cleanup | 0.1-0.5   | 0.2-0.5GB   | ✅ Stable |
| **Total** | **0.9-3.0** | **2-4GB** | **✅ Within Limits** |

## 🚨 Troubleshooting

### **CPU Throttling Still Occurs**
```bash
# Check if containers are respecting limits
docker stats --no-stream

# Restart with fresh resource allocation
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d
```

### **Memory Issues**
```bash
# Check memory usage
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Increase swap if needed (not recommended for production)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

### **Worker Crashes**
```bash
# Check worker logs
docker-compose -f docker-compose.production.yml logs worker

# Restart worker only
docker-compose -f docker-compose.production.yml restart worker
```

## 🔄 Scaling Considerations

### **When to Scale Up**
- **CPU Usage > 80%** consistently
- **Memory Usage > 90%** consistently
- **Response Times > 5 seconds** average

### **Scaling Options**
1. **Vertical Scaling**: Upgrade server specs
2. **Horizontal Scaling**: Add more servers
3. **Load Balancing**: Distribute traffic across servers

## 📈 Monitoring Commands

```bash
# Real-time resource monitoring
watch -n 1 'docker stats --no-stream'

# Log monitoring
docker-compose -f docker-compose.production.yml logs -f --tail=100

# Container health check
docker-compose -f docker-compose.production.yml ps
```

## ✅ Success Indicators

- **CPU Usage**: Below 80% consistently
- **Memory Usage**: Below 90% consistently
- **Response Time**: Under 3 seconds average
- **Worker Stability**: No crashes for 24+ hours
- **Queue Processing**: Jobs complete within 30 seconds

## 🆘 Emergency Procedures

### **Immediate CPU Relief**
```bash
# Stop non-essential services
docker-compose -f docker-compose.production.yml stop cleanup

# Restart with reduced resources
docker-compose -f docker-compose.production.yml restart
```

### **Complete Reset**
```bash
# Stop all services
docker-compose -f docker-compose.production.yml down

# Clear any stuck processes
docker system prune -f

# Restart with fresh state
docker-compose -f docker-compose.production.yml up -d
```

---

**Remember**: This configuration is optimized for **3 CPU / 4GB RAM** servers. If you upgrade your server, you can gradually increase the `NUM_WORKERS` and resource limits.
