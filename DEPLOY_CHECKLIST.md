# Deploy Checklist - NAVQURT

## Pre-Deploy

- [ ] Database migration'larni yaratish: `cd web && npx prisma migrate dev --name init`
- [ ] Database seed script'ni test qilish: `cd web && npm run db:seed`
- [ ] Local'da build test: `cd web && npm run build`
- [ ] Environment variable'larni tayyorlash

## Environment Variables

Quyidagi variable'lar Dokploy'da sozlanishi kerak:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `NEXTAUTH_SECRET` - Random secret (32+ chars)
- [ ] `NEXTAUTH_URL` - Production URL
- [ ] `NODE_ENV=production`

## Dokploy Setup

- [ ] Project yaratildi: `Navqurt`
- [ ] GitHub integration sozlandi
- [ ] Repository: `idrokaiassistant-wq/Navqurt`
- [ ] Branch: `main`
- [ ] Auto Deploy yoqildi
- [ ] Docker service yaratildi
- [ ] Build context: `.`
- [ ] Dockerfile path: `web/Dockerfile`
- [ ] Port: `3000`
- [ ] Environment variables qo'shildi

## Post-Deploy

- [ ] Container ishga tushdi
- [ ] Health check ishlayapti: `/api/health`
- [ ] Database migration ishga tushirildi: `npx prisma migrate deploy`
- [ ] Database seed ishga tushirildi: `npx prisma db seed`
- [ ] Login test: `admin@navqurt.uz` / `admin123`
- [ ] Dashboard ochiladi
- [ ] Barcha sahifalar ishlayapti:
  - [ ] Dashboard
  - [ ] Buyurtmalar
  - [ ] Omborxona
  - [ ] Mahsulotlar
  - [ ] Kategoriyalar
  - [ ] Mijozlar
  - [ ] Sozlamalar

## Test Scenarios

- [ ] Kategoriya qo'shish
- [ ] Mahsulot qo'shish
- [ ] Omborxona mahsulot qo'shish
- [ ] Kirim/Chiqim qo'shish
- [ ] Mijozlar ro'yxatini ko'rish
- [ ] Buyurtmalar ro'yxatini ko'rish

## Troubleshooting

Agar muammo bo'lsa:

1. Container log'larni tekshiring
2. Health check endpoint'ni tekshiring
3. Database connection'ni tekshiring
4. Environment variable'larni tekshiring
5. Prisma migration'larni tekshiring



