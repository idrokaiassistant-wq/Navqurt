# Environment Variables Template

Bu fayl production environment variable'larining template'ini o'z ichiga oladi.

## Production Environment Variables

```env
# Database Configuration (CRITICAL - Production Hardening Required)
# Format: postgresql://user:password@host:port/database?connection_limit=5&pool_timeout=20&connect_timeout=10
# 
# Connection pool parameters (MANDATORY for production):
# - connection_limit: Maximum connections in pool
#   * Serverless/container: 5 (recommended)
#   * Dedicated server: 10-20
# - pool_timeout: Seconds to wait for connection from pool (default: 10, recommended: 20)
# - connect_timeout: Seconds for initial connection (default: 5, recommended: 10)
# - sslmode: SSL mode for production (require/prefer)
#
# Example for production:
DATABASE_URL="postgresql://navqurt_user:secure_password@postgres-host:5432/navqurt_db?connection_limit=5&pool_timeout=20&connect_timeout=10&sslmode=require"

# NextAuth Configuration
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32-minimum-32-characters"
NEXTAUTH_URL="https://your-production-domain.com"

# Admin User (Optional, only for initial seeding)
ADMIN_EMAIL="admin@navqurt.uz"
ADMIN_PASSWORD="change-this-password-in-production"

# Environment
NODE_ENV="production"
```

## Connection Pool Configuration Explained

### Why Connection Pooling?

1. **Prevents Connection Exhaustion**: Limits database connections per application instance
2. **Improves Performance**: Reuses existing connections instead of creating new ones
3. **Resource Management**: Prevents overwhelming PostgreSQL with too many connections

### Recommended Settings by Environment

**Development (local):**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/navqurt?connection_limit=5&pool_timeout=20&connect_timeout=10"
```

**Production (container/serverless):**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?connection_limit=5&pool_timeout=20&connect_timeout=10&sslmode=require"
```

**Production (dedicated server):**
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?connection_limit=15&pool_timeout=20&connect_timeout=10&sslmode=require"
```

## NEXTAUTH_SECRET Generation

```bash
# Generate secure secret (Linux/Mac)
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

## Dokploy Configuration

Dokploy'da bu environment variable'larni quyidagicha sozlang:

1. Project → Settings → Environment Variables
2. Har bir variable'ni qo'shing (yuxoridagi qiymatlar bilan)
3. **DATABASE_URL** ni to'liq connection pool parametrlari bilan kiriting
4. Save qiling

## Verification

Deploy qilingandan keyin connection pool ishlayotganini tekshirish:

```bash
# Health check (should return 200)
curl https://your-domain.com/api/health

# Check database connection (inside container)
docker exec -it <container> node -e "require('./node_modules/.prisma/client').PrismaClient"
```
