# API Hujjatlari

**Asosiy URL:** `/api`  
**Autentifikatsiya:** NextAuth Sessiya (Cookie asosida JWT)

---

## 🔐 Autentifikatsiya

### NextAuth Yo'nalishlari

| Yo'nalish | Metod | Tavsif |
|-----------|-------|--------|
| `/api/auth/signin` | GET | Kirish sahifasi |
| `/api/auth/signout` | POST | Chiqish |
| `/api/auth/session` | GET | Joriy sessiya |
| `/api/auth/csrf` | GET | CSRF token |

---

## 📦 Administrator API

Barcha administrator API'lari autentifikatsiya talab qiladi.

### Mahsulotlar

#### GET /api/admin/products
Barcha mahsulotlarni olish.

**Javob:**
```json
[
  {
    "id": "uuid",
    "name": "Qurt Klassik",
    "description": "Tabiiy qurt",
    "image": "https://cloudinary.com/...",
    "imagePublicId": "navqurt/abc123",
    "price": 50000,
    "weight": 500,
    "isActive": true,
    "createdAt": "2026-01-09T00:00:00Z",
    "categories": [
      {
        "category": {
          "id": "uuid",
          "name": "Klassik"
        }
      }
    ]
  }
]
```

#### POST /api/admin/products
Yangi mahsulot qo'shish.

**So'rov tanasi:**
```json
{
  "name": "Yangi mahsulot",
  "description": "Tavsif",
  "price": 50000,
  "weight": 500,
  "image": "https://...",
  "imagePublicId": "navqurt/...",
  "categoryIds": ["uuid1", "uuid2"]
}
```

#### PATCH /api/admin/products/[id]
Mahsulotni yangilash.

**So'rov tanasi:**
```json
{
  "name": "Yangilangan nom",
  "price": 55000
}
```

#### DELETE /api/admin/products/[id]
Mahsulotni o'chirish.

---

### Kategoriyalar

#### GET /api/admin/categories
Barcha kategoriyalarni olish.

**Javob:**
```json
[
  {
    "id": "uuid",
    "name": "Klassik",
    "color": "#FFD700",
    "createdAt": "2026-01-09T00:00:00Z",
    "_count": {
      "products": 5
    }
  }
]
```

#### POST /api/admin/categories
Yangi kategoriya qo'shish.

**So'rov tanasi:**
```json
{
  "name": "Yangi kategoriya",
  "color": "#FF5733"
}
```

#### PATCH /api/admin/categories/[id]
Kategoriyani yangilash.

#### DELETE /api/admin/categories/[id]
Kategoriyani o'chirish.

---

### Buyurtmalar

#### GET /api/admin/orders
Barcha buyurtmalarni olish.

**Javob:**
```json
[
  {
    "id": "uuid",
    "totalAmount": 150000,
    "deliveryFee": 15000,
    "status": "NEW",
    "comment": "Tez yetkazib bering",
    "createdAt": "2026-01-09T00:00:00Z",
    "user": {
      "fullName": "Ali Valiyev",
      "phone": "+998901234567"
    },
    "region": {
      "name": "Toshkent"
    },
    "items": [
      {
        "quantity": 2,
        "price": 50000,
        "product": {
          "name": "Qurt Klassik"
        }
      }
    ]
  }
]
```

#### PATCH /api/admin/orders/[id]
Buyurtma holatini yangilash.

**So'rov tanasi:**
```json
{
  "status": "CONFIRMED"
}
```

**Holat qiymatlari:** NEW, CONFIRMED, PREPARING, ON_DELIVERY, DELIVERED, CANCELED

---

### Omborxona

#### GET /api/admin/warehouse/items
Ombor mahsulotlarini olish.

**Javob:**
```json
[
  {
    "id": "uuid",
    "name": "Sut",
    "current": 150.5,
    "unit": "litr",
    "minRequired": 50,
    "price": 12000
  }
]
```

#### POST /api/admin/warehouse/items
Yangi ombor mahsuloti qo'shish.

**So'rov tanasi:**
```json
{
  "name": "Tuz",
  "current": 100,
  "unit": "kg",
  "minRequired": 20,
  "price": 5000
}
```

#### PATCH /api/admin/warehouse/items/[id]
Ombor mahsulotini yangilash.

#### DELETE /api/admin/warehouse/items/[id]
Ombor mahsulotini o'chirish.

---

#### GET /api/admin/warehouse/movements
Kirim/chiqim harakatlarini olish.

**Javob:**
```json
[
  {
    "id": "uuid",
    "type": "IN",
    "amount": 50,
    "unit": "kg",
    "price": 250000,
    "note": "Yangi partiya",
    "date": "2026-01-09T00:00:00Z",
    "item": {
      "name": "Sut"
    }
  }
]
```

#### POST /api/admin/warehouse/movements
Yangi kirim/chiqim qo'shish.

**So'rov tanasi:**
```json
{
  "type": "IN",
  "itemId": "uuid",
  "amount": 50,
  "price": 250000,
  "note": "Yangi partiya"
}
```

---

### Mijozlar

#### GET /api/admin/customers
Barcha mijozlarni olish.

**Javob:**
```json
[
  {
    "id": "uuid",
    "telegramId": 123456789,
    "fullName": "Ali Valiyev",
    "phone": "+998901234567",
    "address": "Toshkent, Chilonzor",
    "createdAt": "2026-01-09T00:00:00Z",
    "region": {
      "name": "Toshkent"
    },
    "_count": {
      "orders": 5
    }
  }
]
```

---

### Sozlamalar

#### GET /api/admin/settings
Administrator sozlamalarini olish.

**Javob:**
```json
{
  "id": "uuid",
  "email": "admin@navqurt.uz",
  "name": "Administrator"
}
```

#### PATCH /api/admin/settings
Sozlamalarni yangilash.

**So'rov tanasi (profil):**
```json
{
  "name": "Yangi ism",
  "email": "yangi@email.com"
}
```

**So'rov tanasi (parol):**
```json
{
  "currentPassword": "eski_parol",
  "newPassword": "yangi_parol"
}
```

---

### Yuklash (Rasm Yuklash)

#### POST /api/admin/upload
Cloudinary'ga rasm yuklash.

**So'rov:** `multipart/form-data`
- `file`: Rasm fayli

**Javob:**
```json
{
  "url": "https://res.cloudinary.com/...",
  "publicId": "navqurt/abc123"
}
```

#### POST /api/admin/upload/delete
Cloudinary'dan rasm o'chirish.

**So'rov tanasi:**
```json
{
  "publicId": "navqurt/abc123"
}
```

---

### Sog'liq Tekshiruvi

#### GET /api/health
Server holatini tekshirish.

**Javob:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T00:00:00Z"
}
```

---

## ⚠️ Xato Kodlari

| Kod | Tavsif |
|-----|--------|
| 200 | Muvaffaqiyatli |
| 201 | Yaratildi |
| 400 | Noto'g'ri so'rov |
| 401 | Autentifikatsiya kerak |
| 403 | Ruxsat yo'q |
| 404 | Topilmadi |
| 500 | Server xatosi |

---

*Oxirgi yangilanish: 2026-yil 9-yanvar*
