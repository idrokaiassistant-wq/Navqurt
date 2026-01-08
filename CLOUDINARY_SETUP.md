# Rasm Yuklash Sozlash Qo'llanmasi

## Muammo

Rasm yuklashda xatolik chiqmoqda. Bu quyidagi sabablarga ko'ra bo'lishi mumkin:
- Cloudinary API key'lar sozlanmagan
- Cloudinary sizning mamlakatingizda ishlamayapti (geo-restriction)

## Yechim

Dastur endi **ikkita yechimni** qo'llab-quvvatlaydi:
1. **Cloudinary** (agar mavjud bo'lsa va ishlayotgan bo'lsa)
2. **Local File Storage** (avtomatik fallback yoki asosiy yechim)

Agar Cloudinary sozlanmagan bo'lsa yoki ishlamayotgan bo'lsa, dastur avtomatik ravishda local file storage'dan foydalanadi.

## Yechim

### 1. Cloudinary Account Yaratish

1. [Cloudinary](https://cloudinary.com/) saytiga kiring
2. "Sign Up" tugmasini bosing
3. Account yarating (bepul plan mavjud)

### 2. API Credentials Olish

1. Cloudinary Dashboard'ga kiring
2. "Settings" → "Security" bo'limiga o'ting
3. Quyidagi ma'lumotlarni ko'ring:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 3. Environment Variables Sozlash

#### Local Development (.env.local)

`web/.env.local` faylini yarating yoki tahrirlang:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Misol:**
```env
CLOUDINARY_CLOUD_NAME=navqurt
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

#### Production (Dokploy)

Dokploy'da Service → "Environment Variables" bo'limiga o'ting va quyidagilarni qo'shing:

| Variable | Qiymat | Majburiy |
|----------|--------|----------|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | ✅ |
| `CLOUDINARY_API_KEY` | Cloudinary API key | ✅ |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | ✅ |

### 4. Server Restart

Environment variable'larni o'zgartirgandan keyin:

**Local:**
```bash
# Development server'ni to'xtating (Ctrl+C)
# Keyin qayta ishga tushiring
npm run dev
```

**Production (Dokploy):**
- Environment variable'larni saqlagandan keyin
- Service'ni restart qiling yoki
- Avtomatik deploy bo'ladi (agar Auto Deploy yoqilgan bo'lsa)

### 5. Test Qilish

1. Admin panel'ga kiring
2. Mahsulotlar sahifasiga o'ting
3. "Qo'shish" yoki "Tahrirlash" tugmasini bosing
4. Rasm yuklashni urinib ko'ring

## Xatoliklar

### "Must supply api_key"

**Sabab**: Cloudinary API key'lar sozlanmagan yoki noto'g'ri.

**Yechim**:
1. Environment variable'larni tekshiring
2. Cloudinary Dashboard'dan API credentials'ni qayta ko'rib chiqing
3. Server'ni restart qiling

### "Cloudinary sozlanmagan"

**Sabab**: Environment variable'lar to'liq sozlanmagan.

**Yechim**:
- `CLOUDINARY_CLOUD_NAME` ✅
- `CLOUDINARY_API_KEY` ✅
- `CLOUDINARY_API_SECRET` ✅

Barcha 3 ta variable majburiy!

### "Cloudinary xatosi: Invalid API key"

**Sabab**: API key yoki API secret noto'g'ri.

**Yechim**:
1. Cloudinary Dashboard'dan API credentials'ni qayta ko'rib chiqing
2. Copy-paste qilganda bo'sh joylar qolmasligini tekshiring
3. Environment variable'larni qayta sozlang

## Xavfsizlik

⚠️ **Muhim**: API Secret'ni hech qachon:
- Git repository'ga commit qilmang
- Public kod'ga qo'ymang
- Boshqalarga yubormang

Faqat environment variable sifatida ishlating!

## Qo'shimcha Ma'lumot

- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Cloudinary Node.js SDK](https://cloudinary.com/documentation/node_integration)
- [Environment Variables in Next.js](https://nextjs.org/docs/basic-features/environment-variables)
