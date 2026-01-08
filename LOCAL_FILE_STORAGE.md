# Local File Storage Qo'llanmasi

## Umumiy Ma'lumot

Dastur endi **Local File Storage** yechimini qo'llab-quvvatlaydi. Bu Cloudinary ishlamayotgan mamlakatlar uchun alternativ yechim.

## Qanday Ishlaydi

1. **Avtomatik Fallback**: Agar Cloudinary sozlanmagan bo'lsa yoki xatolik bersa, avtomatik ravishda local storage ishlatiladi
2. **Fayllar saqlanadi**: `public/uploads/` papkasida
3. **URL format**: `/uploads/filename.jpg`

## Sozlash

### Hech qanday sozlash kerak emas!

Local file storage **avtomatik ishlaydi**. Agar Cloudinary sozlanmagan bo'lsa, dastur avtomatik ravishda local storage'dan foydalanadi.

### Environment Variables

Agar Cloudinary ishlatmoqchi bo'lsangiz (lekin majburiy emas):
- `CLOUDINARY_CLOUD_NAME` (ixtiyoriy)
- `CLOUDINARY_API_KEY` (ixtiyoriy)
- `CLOUDINARY_API_SECRET` (ixtiyoriy)

Agar bu variable'lar sozlanmagan bo'lsa, local storage ishlatiladi.

## Fayllar Joylashuvi

- **Papka**: `web/public/uploads/`
- **URL**: `https://your-domain.com/uploads/filename.jpg`

## Xavfsizlik

⚠️ **Muhim**: 
- `public/uploads/` papkasi public bo'ladi
- Barcha fayllar to'g'ridan-to'g'ri URL orqali kirish mumkin
- Faqat admin foydalanuvchilar yuklash huquqiga ega (API endpoint'da `assertAdmin` tekshiruvi mavjud)

## Production Deploy

### Dokploy'da

1. **Hech qanday qo'shimcha sozlash kerak emas**
2. `public/uploads/` papkasi avtomatik yaratiladi
3. Fayllar container ichida saqlanadi

### Eslatma

- Container restart qilinganda fayllar saqlanib qoladi (agar volume mount qilingan bo'lsa)
- Agar volume mount qilinmagan bo'lsa, container o'chirilganda fayllar yo'qoladi

### Volume Mount (Tavsiya etiladi)

Dokploy'da Service → "Volumes" bo'limiga o'ting va quyidagini qo'shing:

```
/app/public/uploads -> /data/uploads
```

Bu fayllarni container o'chirilganda ham saqlab qoladi.

## Test Qilish

1. Admin panel'ga kiring
2. Mahsulotlar sahifasiga o'ting
3. "Qo'shish" yoki "Tahrirlash" tugmasini bosing
4. Rasm yuklashni urinib ko'ring
5. Rasm `public/uploads/` papkasida saqlanadi
6. URL: `/uploads/timestamp-random.jpg` formatida bo'ladi

## Xatoliklar

### "Rasm yuklash xatosi"

**Sabab**: `public/uploads/` papkasi yaratilmagan yoki yozish huquqi yo'q.

**Yechim**:
1. `public/uploads/` papkasini yarating
2. Yozish huquqini tekshiring (chmod 755 yoki 777)

### "Fayl topilmadi"

**Sabab**: FormData to'g'ri yuborilmagan.

**Yechim**: Frontend'da `apiPostFormData` funksiyasini tekshiring.

## Qo'shimcha Ma'lumot

- Fayllar `public/uploads/` papkasida saqlanadi
- Har bir fayl unique nom bilan saqlanadi: `timestamp-random.extension`
- Fayl o'chirish: `public_id` (filename) orqali
