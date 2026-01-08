# Dokploy Deploy Qo'llanmasi

## GitHub'ga Push

Loyiha GitHub'ga push qilingan: `https://github.com/idrokaiassistant-wq/Navqurt.git`

## Dokploy'da Sozlash

### 1. Dokploy UI'da Project Yaratish

1. Dokploy dashboard'ga kiring
2. "Projects" bo'limiga o'ting
3. "Create Project" tugmasini bosing
4. Project nomini kiriting: `Navqurt`

### 2. GitHub Integration Sozlash

1. Project ichida "Settings" → "Git" bo'limiga o'ting
2. "Connect GitHub" tugmasini bosing
3. GitHub repository'ni tanlang: `idrokaiassistant-wq/Navqurt`
4. Branch: `main`
5. "Auto Deploy" ni yoqing (push bo'lganda avtomatik deploy)

### 3. Service Yaratish

1. Project ichida "+ Create Service" tugmasini bosing
2. Service turini tanlang: "Docker" yoki "Application"
3. Quyidagi sozlamalarni kiriting:

**Build Settings:**
- **Build Context**: `.` (root directory)
- **Dockerfile Path**: `web/Dockerfile`
- **Build Command**: (bo'sh qoldirish mumkin, Dockerfile'da bor)

**Runtime Settings:**
- **Port**: `3000`
- **Environment Variables**:
  ```
  DATABASE_URL=postgresql://user:password@host:5432/dbname
  NEXTAUTH_SECRET=your-secret-key-here
  NEXTAUTH_URL=https://your-domain.com
  ADMIN_EMAIL=admin@navqurt.uz
  ADMIN_PASSWORD=admin123
  NODE_ENV=production
  ```

### 4. Database Service (Agar kerak bo'lsa)

Agar PostgreSQL alohida service sifatida kerak bo'lsa:

1. "+ Create Service" → "Database" → "PostgreSQL"
2. Database nomi: `navqurt-db`
3. Environment variable: `DATABASE_URL` avtomatik yaratiladi

### 5. Deploy

1. "Deploy" tugmasini bosing
2. Yoki GitHub'ga push qilinganida avtomatik deploy bo'ladi (agar Auto Deploy yoqilgan bo'lsa)

## Environment Variables

Quyidagi environment variable'lar majburiy:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth uchun secret key (random string)
- `NEXTAUTH_URL` - Production URL (masalan: `https://navqurt.uz`)

Ixtiyoriy:

- `ADMIN_EMAIL` - Admin email (default: `admin@navqurt.uz`)
- `ADMIN_PASSWORD` - Admin parol (default: `admin123`)

## Health Check

Health check endpoint: `/api/health` (agar yaratilgan bo'lsa)

## Troubleshooting

### Build xatosi
- Dockerfile'da path'lar to'g'ri ekanligini tekshiring
- Prisma schema path'ini tekshiring: `prisma/schema.prisma`

### Database connection xatosi
- `DATABASE_URL` to'g'ri ekanligini tekshiring
- Database service ishlamoqda ekanligini tekshiring

### Port xatosi
- Port 3000 ochiq ekanligini tekshiring
- Dokploy'da port mapping to'g'ri ekanligini tekshiring

## GitHub Webhook (Avtomatik Deploy)

Dokploy'da GitHub integration sozlanganda, har safar `main` branch'ga push qilinganda avtomatik deploy bo'ladi.

Webhook URL Dokploy tomonidan yaratiladi va GitHub repository Settings → Webhooks bo'limida ko'rinadi.




