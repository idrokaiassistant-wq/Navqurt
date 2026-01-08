# O'zgarishlar Tarixi

NAVQURT loyihasida qilingan barcha ishlar.

---

## [1.0.0] - 2026-yil 9-yanvar

### 🎉 Loyiha yaratildi

#### Arxitektura
- Next.js 16.1.1 (App Router) asosida loyiha boshlandi
- TypeScript qo'shildi
- Tailwind CSS 4.x sozlandi
- Prisma ORM 5.22.0 integratsiya qilindi
- PostgreSQL ma'lumotlar bazasi tanlandi

#### Autentifikatsiya
- NextAuth.js 4.24.13 o'rnatildi
- Credentials provayderi (elektron pochta/parol) sozlandi
- Administrator kirish sahifasi yaratildi
- JWT sessiya boshqaruvi

#### Ma'lumotlar Bazasi
- 11 ta jadval yaratildi:
  - User, AdminUser
  - Category, Product, ProductCategory, Variant
  - Region, Order, OrderItem
  - StockItem, StockMovement
- 4 ta ro'yxat turi: Role, OrderStatus, TasteType, StockMovementType
- Boshlang'ich ma'lumotlar skripti yaratildi (admin foydalanuvchi)

#### Boshqaruv Paneli Sahifalari
- **Boshqaruv Paneli** - statistikalar, so'nggi buyurtmalar
- **Buyurtmalar** - ro'yxat, holat boshqaruvi
- **Omborxona** - mahsulotlar, kirim/chiqim
- **Mahsulotlar** - CRUD, rasm yuklash
- **Kategoriyalar** - CRUD
- **Mijozlar** - ro'yxat, qidiruv
- **Sozlamalar** - profil, parol, bildirishnomalar, mavzu

#### API Yo'nalishlari
- 18+ yo'nalish yaratildi
- 7 ta modul: mahsulotlar, kategoriyalar, buyurtmalar, omborxona, sozlamalar, yuklash, mijozlar
- Tiplangan API mijoz (`api-client.ts`)
- Xatolik boshqaruvi (`handleApiError`)

#### UI/UX
- Qorong'i glassmorphism dizayn
- Moslashuvchan tartib (mobil, planshet, kompyuter)
- Yon panel navigatsiya
- Modal muloqot oynalari
- Yuklash holatlari
- Toast bildirishnomalar

#### Rasm Yuklash
- Cloudinary integratsiya
- Rasm yuklash va o'chirish
- `imagePublicId` sxemaga qo'shildi

#### Holat Boshqaruvi
- Zustand holati sozlandi
- Mavzu (qorong'i/yorug') almashtirish

---

## [0.9.0] - 2026-yil 6-yanvar

### Joylashtirish

#### Dokploy
- Dokploy'ga birinchi joylashtirish
- Docker rasm: `navqurt-navqurtweb-d0pnc9:latest`
- Nixpacks v1.39.0 build

#### Domen
- navqurt.uz domenini ulash boshlandi
- DNS yozuvlar qo'shildi
- SSL sertifikat kutilmoqda

---

## [0.8.0] - 2026-yil 5-yanvar

### Ma'lumotlar Bazasi

#### PostgreSQL ulanish
- Dokploy PostgreSQL yaratildi
- DATABASE_URL sozlandi
- Prisma sxema push

#### GitHub
- Repositoriya yaratildi: `idrokaiassistant-wq/Navqurt`
- `.gitignore` sozlandi
- Birinchi push amalga oshirildi

---

## Kelgusi Rejalar

### [1.1.0] - Rejalashtirilgan
- [ ] Telegram bot integratsiya
- [ ] Real-time bildirishnomalar
- [ ] Hisobot generatsiya (PDF)
- [ ] Ko'p tillilik qo'llab-quvvatlash

### [1.2.0] - Rejalashtirilgan
- [ ] Tahlil boshqaruv paneli
- [ ] Excel'ga eksport
- [ ] Zaxira va tiklash

---

*Oxirgi yangilanish: 2026-yil 9-yanvar*
