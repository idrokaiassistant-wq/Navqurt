# Joylashtirish Qo'llanmasi

NAVQURT loyihasini ishlab chiqarish muhitiga joylashtirish.

---

## 🚀 Joylashtirish Usullari

### 1. Dokploy (Tavsiya etiladi)

#### 1.1 Oldindan tayyorgarlik
- Dokploy server IP: `194.164.72.8`
- PostgreSQL ma'lumotlar bazasi yaratilgan bo'lishi kerak

#### 1.2 Loyiha yaratish

1. Dokploy boshqaruv paneliga kiring
2. "Loyihalar" → "Loyiha yaratish"
3. Nom: `Navqurt`

#### 1.3 GitHub ulanish

1. "Sozlamalar" → "Git"
2. "GitHub ulash"
3. Repositoriya: `idrokaiassistant-wq/Navqurt`
4. Tarmoq: `main`
5. "Avtomatik joylashtirish" → Yoqish

#### 1.4 Xizmat yaratish

1. "+ Xizmat yaratish" → "Docker"
2. Sozlamalar:
   - Build konteksti: `.`
   - Dockerfile yo'li: `web/Dockerfile`
   - Port: `3000`

#### 1.5 Muhit O'zgaruvchilari

```env
DATABASE_URL=postgresql://foydalanuvchi:parol@host:5432/navqurt
NEXTAUTH_SECRET=sizning-xavfsiz-tasodifiy-qatoringiz
NEXTAUTH_URL=https://navqurt.uz
ADMIN_EMAIL=admin@navqurt.uz
ADMIN_PASSWORD=admin123
NODE_ENV=production

# Cloudinary (ixtiyoriy)
CLOUDINARY_CLOUD_NAME=sizning-cloud
CLOUDINARY_API_KEY=sizning-kalit
CLOUDINARY_API_SECRET=sizning-maxfiy-kalit
```

> ⚠️ `NEXTAUTH_SECRET` uchun kamida 32 belgili tasodifiy qator ishlating

#### 1.6 Joylashtirish

"Joylashtirish" tugmasini bosing yoki GitHub'ga push qiling (avtomatik joylashtirish).

---

### 2. Vercel

#### 2.1 Vercel CLI

```bash
npm i -g vercel
cd web
vercel
```

#### 2.2 Muhit O'zgaruvchilari

Vercel Boshqaruv Paneli → Sozlamalar → Muhit O'zgaruvchilari:
- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL
- CLOUDINARY_*

---

## 🌐 Domen Sozlash

### DNS Yozuvlar (navqurt.uz uchun)

| Turi | Nom | Qiymat | TTL |
|------|-----|--------|-----|
| A | @ | 194.164.72.8 | 3600 |
| CNAME | www | navqurt.uz. | 3600 |

### SSL Sertifikat

Dokploy Let's Encrypt orqali avtomatik SSL sertifikat oladi. DNS tarqalishi tugagandan so'ng (15-30 daqiqa) SSL faollashadi.

---

## 🗄 Ma'lumotlar Bazasi Sozlash

### PostgreSQL yaratish (Dokploy)

1. "+ Xizmat yaratish" → "Ma'lumotlar bazasi" → "PostgreSQL"
2. Ma'lumotlar bazasi nomi: `navqurt-db`
3. `DATABASE_URL` muhit o'zgaruvchisini olish

### Prisma migratsiya

```bash
# Build vaqtida avtomatik bajariladi (postinstall)
npx prisma generate

# Ma'lumotlar bazasi sxemasini qo'llash
npx prisma db push

# Boshlang'ich ma'lumotlar (admin yaratish)
npm run db:seed
```

---

## 🐳 Docker

### Dockerfile (`web/Dockerfile`)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

### Build va Ishga Tushirish

```bash
docker build -t navqurt-web ./web
docker run -p 3000:3000 --env-file .env navqurt-web
```

---

## ✅ Joylashtirish Tekshiruv Ro'yxati

- [ ] PostgreSQL ma'lumotlar bazasi mavjud
- [ ] Muhit o'zgaruvchilari sozlangan
- [ ] `NEXTAUTH_SECRET` xavfsiz
- [ ] DNS A yozuvi to'g'ri
- [ ] SSL sertifikat faol
- [ ] Administrator kirish ishlaydi
- [ ] Sog'liq tekshiruvi: `/api/health`

---

## 🔧 Muammolarni Bartaraf Qilish

### Build xatosi: Prisma sxema topilmadi

```bash
# Dockerfile'da yo'lni tekshirish
COPY prisma ./prisma
RUN npx prisma generate
```

### Ma'lumotlar bazasi ulanish xatosi (P1001)

- DATABASE_URL to'g'ri ekanligini tekshiring
- Ma'lumotlar bazasi serveri ishlamoqda ekanligini tekshiring
- Firewall sozlamalarini tekshiring

### 502 Bad Gateway

- Port 3000 ochiq ekanligini tekshiring
- `next start` buyruqlari to'g'ri ekanligini tekshiring
- Loglarni tekshiring

### SSL ishlamayapti

- DNS tarqalishini kutish (24 soatgacha)
- A yozuvi to'g'ri IP'ga ishora qilishini tekshiring

---

*Oxirgi yangilanish: 2026-yil 9-yanvar*
