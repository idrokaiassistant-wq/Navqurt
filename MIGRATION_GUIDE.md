# Database Migration Qo'llanmasi

## PostgreSQL'da Rasm Saqlash

Yangi `Image` model qo'shildi va `Product` model yangilandi. Migration yaratish va ishga tushirish kerak.

## Migration Yaratish

### 1. Migration Yaratish

```bash
cd web
npx prisma migrate dev --name add_image_model
```

Bu quyidagi migration'ni yaratadi:
- `Image` jadvali yaratiladi
- `Product` jadvaliga `imageId` column qo'shiladi
- Foreign key constraint qo'shiladi

### 2. Migration Ishga Tushirish (Production)

```bash
cd web
npx prisma migrate deploy
```

## Migration Fayl Tarkibi

Migration quyidagilarni qiladi:

1. **Image jadvali yaratiladi**:
   ```sql
   CREATE TABLE "Image" (
     "id" TEXT NOT NULL,
     "filename" TEXT NOT NULL,
     "mimeType" TEXT NOT NULL,
     "data" TEXT NOT NULL,
     "size" INTEGER NOT NULL,
     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
     CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
   );
   ```

2. **Product jadvaliga imageId qo'shiladi**:
   ```sql
   ALTER TABLE "Product" ADD COLUMN "imageId" TEXT;
   ```

3. **Foreign key constraint qo'shiladi**:
   ```sql
   ALTER TABLE "Product" ADD CONSTRAINT "Product_imageId_fkey" 
   FOREIGN KEY ("imageId") REFERENCES "Image"("id") 
   ON DELETE SET NULL ON UPDATE CASCADE;
   ```

## Backward Compatibility

- `image` va `imagePublicId` column'lar saqlanadi (deprecated)
- Eski rasmlar ishlashda davom etadi
- Yangi rasmlar database'ga saqlanadi

## Test Qilish

Migration ishga tushgandan keyin:

1. Admin panel'ga kiring
2. Mahsulotlar sahifasiga o'ting
3. "Qo'shish" tugmasini bosing
4. Rasm yuklashni urinib ko'ring
5. Rasm database'ga saqlanadi va `/api/images/[id]` orqali ko'rsatiladi

## Xatoliklar

### "Table 'Image' already exists"

**Sabab**: Migration allaqachon ishga tushirilgan.

**Yechim**: 
```bash
npx prisma migrate deploy
```

### "Column 'imageId' already exists"

**Sabab**: Migration allaqachon ishga tushirilgan.

**Yechim**: Migration'ni skip qiling yoki database'ni tekshiring.

## Production Deploy

Dokploy'da deploy qilgandan keyin:

1. Container'ga kiring:
   ```bash
   docker exec -it <container-name> sh
   ```

2. Migration ishga tushiring:
   ```bash
   cd /app
   npx prisma migrate deploy
   ```

Yoki Dokploy'da "Execute Command":
```bash
cd /app && npx prisma migrate deploy
```

## Database Hajmi

⚠️ **Eslatma**: PostgreSQL'da base64 formatida rasm saqlash database hajmini oshiradi:
- 1MB rasm → ~1.33MB database'da (base64 encoding overhead)
- Kichik rasmlar (< 1MB) uchun yaxshi
- Katta rasmlar (> 5MB) uchun sekin bo'lishi mumkin

**Tavsiya**: Rasm hajmini 1MB dan kichik qilib optimallashtirish.
