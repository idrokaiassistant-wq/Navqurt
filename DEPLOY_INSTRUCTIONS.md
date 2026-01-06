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
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

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
- `DATABASE_URL` to'g'ri ekanligini tekshiring
- Database service ishlamoqda ekanligini tekshiring
- Network connectivity tekshiring

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


