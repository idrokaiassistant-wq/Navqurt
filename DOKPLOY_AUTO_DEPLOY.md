# Dokploy Avtomatik Deploy Qo'llanmasi

## ✅ GitHub'ga Push Qilindi

Dastur GitHub'ga muvaffaqiyatli push qilindi:
- **Repository**: `https://github.com/idrokaiassistant-wq/Navqurt.git`
- **Branch**: `main`
- **Commit**: `38e34851`

---

## Dokploy'da Avtomatik Deploy Sozlash

### 1. Dokploy Dashboard'ga Kirish

1. Dokploy dashboard'ga kiring
2. "Projects" bo'limiga o'ting

### 2. Project Yaratish (Agar mavjud bo'lmasa)

1. "Create Project" tugmasini bosing
2. Project nomini kiriting: `Navqurt`
3. "Create" tugmasini bosing

### 3. GitHub Integration Sozlash

1. Project ichida "Settings" → "Git" bo'limiga o'ting
2. "Connect GitHub" tugmasini bosing
3. GitHub repository'ni tanlang: `idrokaiassistant-wq/Navqurt`
4. **Branch**: `main`
5. **Auto Deploy**: ✅ **YOQING** (Bu muhim!)
6. "Save" tugmasini bosing

**Eslatma**: Auto Deploy yoqilganda, har safar `main` branch'ga push qilinganda avtomatik deploy bo'ladi.

### 4. Service Yaratish (Agar mavjud bo'lmasa)

1. Project ichida "+ Create Service" tugmasini bosing
2. Service turini tanlang: **"Docker"** yoki **"Application"**

#### Build Settings:

- **Build Context**: `.` (root directory)
- **Dockerfile Path**: `web/Dockerfile`
- **Build Command**: (bo'sh qoldirish mumkin, Dockerfile'da bor)

#### Runtime Settings:

- **Port**: `3000`
- **Environment Variables**: Quyidagilarni kiriting:

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=<openssl rand -base64 32 natijasi>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

**NEXTAUTH_SECRET yaratish:**
```bash
openssl rand -base64 32
```

### 5. Environment Variables Sozlash

Dokploy'da Service → "Environment Variables" bo'limiga o'ting va quyidagilarni qo'shing:

| Variable | Qiymat | Majburiy |
|----------|--------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_SECRET` | Random 32+ character string | ✅ |
| `NEXTAUTH_URL` | Production URL (masalan: `https://navqurt.uz`) | ✅ |
| `NODE_ENV` | `production` | ✅ |
| `ADMIN_EMAIL` | `admin@navqurt.uz` | ❌ (ixtiyoriy) |
| `ADMIN_PASSWORD` | `admin123` | ❌ (ixtiyoriy) |

### 6. Avtomatik Deploy Test Qilish

1. **GitHub'ga push qiling** (allaqachon qilingan ✅)
2. Dokploy'da "Deployments" bo'limiga o'ting
3. Yangi deployment avtomatik boshlanishi kerak
4. Build va deploy jarayonini kuzatib turing

### 7. Post-Deploy (Migration va Seed)

Container ishga tushgandan keyin:

#### Variant 1: Dokploy UI orqali

1. Service → "Execute Command" bo'limiga o'ting
2. Quyidagi buyruqni kiriting:

```bash
cd /app && npx prisma migrate deploy && npx prisma db seed
```

#### Variant 2: Docker exec orqali

```bash
# Container nomini topish
docker ps

# Container'ga kirish
docker exec -it <container-name> sh

# Migration va seed
cd /app
npx prisma migrate deploy
npx prisma db seed
```

### 8. Health Check

Deploy qilingandan keyin tekshiring:

1. **Health endpoint**: `https://your-domain.com/api/health`
2. **Login sahifa**: `https://your-domain.com/login`
   - Email: `admin@navqurt.uz`
   - Parol: `admin123`

---

## Avtomatik Deploy Ishlash Prinsipi

1. **GitHub Webhook**: Dokploy GitHub'ga webhook yaratadi
2. **Push Event**: `main` branch'ga push qilinganda GitHub webhook'ni chaqiradi
3. **Auto Deploy**: Dokploy webhook'ni qabul qilib, avtomatik deploy boshlaydi
4. **Build**: Dockerfile asosida build qilinadi
5. **Deploy**: Yangi container yaratiladi va eski container o'chiriladi

---

## Troubleshooting

### Auto Deploy Ishlamayapti

1. **GitHub Integration tekshiring**:
   - Settings → Git → Repository to'g'ri ekanligini tekshiring
   - Auto Deploy yoqilgan ekanligini tekshiring

2. **GitHub Webhook tekshiring**:
   - GitHub → Repository → Settings → Webhooks
   - Dokploy webhook mavjudligini tekshiring
   - Webhook event'larini tekshiring (push event yoqilgan bo'lishi kerak)

3. **Manual Deploy**:
   - Agar auto deploy ishlamasa, "Deploy" tugmasini bosing

### Build Xatosi

1. **Dockerfile path tekshiring**: `web/Dockerfile`
2. **Build context tekshiring**: `.` (root directory)
3. **Log'larni ko'ring**: Dokploy'da "Logs" bo'limida build log'larini ko'ring

### Database Connection Xatosi

1. **DATABASE_URL tekshiring**: To'g'ri ekanligini tekshiring
2. **Database service ishlamoqda ekanligini tekshiring**
3. **Network connectivity tekshiring**: Container database'ga ulana olayotganini tekshiring

### Port Xatosi

1. **Port 3000 ochiq ekanligini tekshiring**
2. **Port mapping to'g'ri ekanligini tekshiring**: `3000:3000`

---

## Keyingi Qadamlar

1. ✅ GitHub'ga push qilindi
2. ⏳ Dokploy'da GitHub integration sozlash
3. ⏳ Auto Deploy yoqish
4. ⏳ Environment variables sozlash
5. ⏳ Service yaratish (agar mavjud bo'lmasa)
6. ⏳ Deploy test qilish
7. ⏳ Migration va seed ishga tushirish
8. ⏳ Health check tekshirish

---

## Foydali Linklar

- **GitHub Repository**: https://github.com/idrokaiassistant-wq/Navqurt.git
- **Dokploy Documentation**: https://dokploy.com/docs
- **Dockerfile**: `web/Dockerfile`
- **Deploy Qo'llanmasi**: `DEPLOY.md`

---

**Eslatma**: Avtomatik deploy ishlashi uchun Dokploy'da GitHub integration va Auto Deploy yoqilgan bo'lishi kerak!
