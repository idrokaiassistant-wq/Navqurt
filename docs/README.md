# NAVQURT - Boshqaruv Paneli

**Versiya:** 1.0.0  
**Yaratilgan sana:** 2026-yil  
**Texnologiyalar:** Next.js 16.1.1, Prisma ORM, PostgreSQL, Tailwind CSS

---

## 📋 Loyiha Haqida

NAVQURT - bu an'anaviy qurt (quruq pishloq) ishlab chiqarish va sotish uchun mo'ljallangan zamonaviy boshqaruv paneli. Loyiha buyurtmalarni boshqarish, mahsulotlarni qo'shish, omborxonani nazorat qilish va mijozlarni kuzatish imkoniyatlarini taqdim etadi.

### Asosiy Xususiyatlar

- 🛒 **Buyurtmalar boshqaruvi** - yangi, tasdiqlangan, tayyorlanayotgan, yo'lda, yetkazildi holatlari
- 📦 **Mahsulotlar katalogi** - rasm yuklash, kategoriyalar, ta'm turlari
- 🏭 **Omborxona nazorati** - kirim/chiqim harakatlari, minimal zaxira ogohlantirishi
- 👥 **Mijozlar bazasi** - Telegram bot orqali ro'yxatdan o'tgan foydalanuvchilar
- ⚙️ **Sozlamalar** - administrator profili, parol, bildirishnomalar, mavzu

---

## 🛠 Texnologiyalar

| Texnologiya | Versiya | Vazifasi |
|-------------|---------|----------|
| Next.js | 16.1.1 | Foydalanuvchi interfeysi va server |
| React | 19.2.3 | UI kutubxonasi |
| TypeScript | 5.x | Kodni tiplash |
| Prisma ORM | 5.22.0 | Ma'lumotlar bazasi bilan ishlash |
| PostgreSQL | - | Ma'lumotlar bazasi |
| NextAuth | 4.24.13 | Autentifikatsiya (kirish tizimi) |
| Zustand | 5.0.9 | Holat boshqaruvi |
| Cloudinary | 2.8.0 | Rasmlarni saqlash |
| Tailwind CSS | 4.x | Dizayn |
| Lucide React | 0.562.0 | Ikonkalar |

---

## 🚀 O'rnatish

### Talablar
- Node.js 20.x
- PostgreSQL ma'lumotlar bazasi
- Cloudinary hisobi (ixtiyoriy, rasmlar uchun)

### Qadamlar

```bash
# 1. Repositoriyani yuklab olish
git clone https://github.com/idrokaiassistant-wq/Navqurt.git
cd Navqurt/web

# 2. Paketlarni o'rnatish
npm install

# 3. Muhit o'zgaruvchilarini sozlash
cp .env.example .env
# .env faylini tahrirlang

# 4. Ma'lumotlar bazasini sozlash
npx prisma db push
npx prisma db seed

# 5. Ishga tushirish
npm run dev
```

### Muhit O'zgaruvchilari

```env
DATABASE_URL="postgresql://foydalanuvchi:parol@host:5432/dbname"
NEXTAUTH_SECRET="sizning-maxfiy-kalitingiz"
NEXTAUTH_URL="http://localhost:3000"
ADMIN_EMAIL="admin@navqurt.uz"
ADMIN_PASSWORD="admin123"
CLOUDINARY_CLOUD_NAME="sizning-cloud-nomingiz"
CLOUDINARY_API_KEY="sizning-api-kalitingiz"
CLOUDINARY_API_SECRET="sizning-api-maxfiy-kalitingiz"
```

---

## 📁 Papka Tuzilmasi

```
c:\NAVQUR\
├── docs/                    # Hujjatlar
├── web/                     # Next.js ilova
│   ├── prisma/              # Prisma sxema va boshlang'ich ma'lumotlar
│   ├── public/              # Statik fayllar
│   └── src/
│       ├── app/             # Next.js App Router
│       │   ├── api/         # API yo'nalishlari
│       │   ├── dashboard/   # Boshqaruv paneli sahifalari
│       │   └── login/       # Kirish sahifasi
│       ├── components/      # React komponentlar
│       ├── lib/             # Yordamchi funksiyalar
│       └── types/           # TypeScript tiplari
├── domen/                   # DNS va domen hujjatlari
└── README.md
```

---

## 📚 Hujjatlar

| Hujjat | Tavsif |
|--------|--------|
| [ARXITEKTURA.md](./ARXITEKTURA.md) | Loyiha arxitekturasi |
| [MALUMOTLAR_BAZASI.md](./MALUMOTLAR_BAZASI.md) | Ma'lumotlar bazasi tuzilmasi |
| [API.md](./API.md) | API hujjatlari |
| [KOMPONENTLAR.md](./KOMPONENTLAR.md) | Komponentlar ro'yxati |
| [JOYLASHTIRISH.md](./JOYLASHTIRISH.md) | Joylashtirish qo'llanmasi |
| [OZGARISHLAR.md](./OZGARISHLAR.md) | O'zgarishlar tarixi |
| [HISOBOTLAR.md](./HISOBOTLAR.md) | Audit va hisobotlar |
| [TAQDIMOT.md](./TAQDIMOT.md) | Loyiha taqdimoti |

---

## 👤 Administrator Kirish

Standart administrator ma'lumotlari:
- **Elektron pochta:** admin@navqurt.uz
- **Parol:** admin123

> ⚠️ Ishlab chiqarish muhitida parolni albatta o'zgartiring!

---

## 📞 Aloqa

- **GitHub:** [idrokaiassistant-wq/Navqurt](https://github.com/idrokaiassistant-wq/Navqurt)
- **Domen:** navqurt.uz

---

*Oxirgi yangilanish: 2026-yil 9-yanvar*
