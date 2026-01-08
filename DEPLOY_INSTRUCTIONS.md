# Deploy Qo'llanmasi - NAVQURT

## 1. Database Migration

Deploy qilishdan oldin database migration'larni ishga tushirish kerak:

```bash
cd web
npx prisma migrate deploy
```

Yoki yangi migration yaratish:

```bash
cd web
npx prisma migrate dev --name init
```

## 2. Database Seed (Admin User)

Admin foydalanuvchi yaratish:

```bash
cd web
npx prisma db seed
```

Yoki manual:

```bash
cd web
node -e "require('./prisma/seed.ts')"
```

**Admin ma'lumotlari:**
- Email: `admin@navqurt.uz`
- Parol: `admin123`

## 3. Environment Variables

Dokploy'da quyidagi environment variable'larni sozlang:

```env
# Production-hardened DATABASE_URL with connection pooling parameters
# Format: postgresql://user:password@host:port/database?connection_limit=5&pool_timeout=20&connect_timeout=10
# 
# Connection pool parameters (CRITICAL for production performance):
# - connection_limit: Maximum connections in pool (5 for serverless, 10-20 for dedicated)
# - pool_timeout: Seconds to wait for connection from pool (20 recommended)
# - connect_timeout: Seconds for initial connection (10 recommended)
# - sslmode: Required for production databases (require/prefer)
DATABASE_URL=postgresql://user:password@host:5432/dbname?connection_limit=5&pool_timeout=20&connect_timeout=10&sslmode=require

NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

**Important:** Production'da DATABASE_URL'ga connection pool parametrlarini qo'shish **majburiy**. Bu connection exhaustion muammosini oldini oladi.

**NEXTAUTH_SECRET yaratish:**
```bash
openssl rand -base64 32
```

## 4. Dokploy'da Deploy

### 4.1. Project Yaratish

1. Dokploy dashboard → "Projects" → "Create Project"
2. Project nomi: `Navqurt`

### 4.2. GitHub Integration

1. Project → "Settings" → "Git"
2. "Connect GitHub" → Repository: `idrokaiassistant-wq/Navqurt`
3. Branch: `main`
4. Auto Deploy: ✅ (yoqing)

### 4.3. Service Yaratish

1. "+ Create Service" → "Docker"
2. **Build Settings:**
   - Build Context: `.` (root)
   - Dockerfile Path: `web/Dockerfile`
3. **Runtime:**
   - Port: `3000`
   - Environment Variables: (yuqoridagi env'larni kiriting)

### 4.4. Deploy

1. "Deploy" tugmasini bosing
2. Yoki GitHub'ga push qiling (auto deploy)

## 5. Post-Deploy

### 5.1. Database Migration

Container ishga tushgandan keyin migration'larni ishga tushiring:

```bash
# Container ichida
docker exec -it <container-name> sh
cd /app
npx prisma migrate deploy
npx prisma db seed
```

Yoki Dokploy'da "Execute Command" orqali:

```bash
cd /app && npx prisma migrate deploy && npx prisma db seed
```

### 5.2. Health Check

Health check endpoint: `https://your-domain.com/api/health`

## 6. Troubleshooting

### Build xatosi
- Dockerfile path to'g'ri ekanligini tekshiring
- Prisma schema path: `web/prisma/schema.prisma`

### Database connection xatosi
- `DATABASE_URL` to'g'ri ekanligini tekshiring (connection_limit, pool_timeout parametrlar bilan)
- Database service ishlamoqda ekanligini tekshiring
- Network connectivity tekshiring
- Connection pool exhaustion: `DATABASE_URL`da `connection_limit=5` parametrini tekshiring
- Active connections tekshirish: PostgreSQL'da `SELECT count(*) FROM pg_stat_activity;`

### Port xatosi
- Port 3000 ochiq ekanligini tekshiring
- Dokploy'da port mapping to'g'ri ekanligini tekshiring

### Prisma Client xatosi
- Migration'larni ishga tushiring: `npx prisma migrate deploy`
- Prisma Client'ni generate qiling: `npx prisma generate`

## 7. Test

Deploy qilingandan keyin:

1. Health check: `https://your-domain.com/api/health`
2. Login: `https://your-domain.com/login`
   - Email: `admin@navqurt.uz`
   - Parol: `admin123`
3. Dashboard: `https://your-domain.com/dashboard`

## 8. Auto Deploy

GitHub'ga push qilinganda avtomatik deploy bo'ladi (agar Auto Deploy yoqilgan bo'lsa).




