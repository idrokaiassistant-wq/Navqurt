# Komponentlar Ro'yxati

Loyihadagi barcha React komponentlar va sahifalar hujjati.

---

## 📂 Papka Tuzilmasi

```
src/
├── components/           # Qayta ishlatiluvchi komponentlar
│   ├── ui/               # Shadcn/UI bazaviy komponentlar
│   ├── sidebar.tsx       # Asosiy navigatsiya
│   └── splash-screen.tsx # Yuklash ekrani
└── app/                  # Sahifalar (Next.js App Router)
    ├── dashboard/        # Boshqaruv paneli sahifalari
    └── login/            # Kirish sahifasi
```

---

## 🧩 UI Komponentlar

### Button (Tugma) (`ui/button.tsx`)
Tugma komponenti. Variantlar: default, destructive, outline, secondary, ghost, link.

```tsx
<Button variant="default" size="lg">
  Saqlash
</Button>
```

---

### Input (Kiritish Maydoni) (`ui/input.tsx`)
Kiritish maydoni komponenti.

```tsx
<Input
  type="text"
  placeholder="Mahsulot nomi"
  value={nom}
  onChange={(e) => setNom(e.target.value)}
/>
```

---

### Dialog (Muloqot Oynasi) (`ui/dialog.tsx`)
Modal muloqot oynasi.

```tsx
<Dialog open={ochiq} onOpenChange={setOchiq}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Yangi mahsulot</DialogTitle>
    </DialogHeader>
    {/* Forma mazmuni */}
  </DialogContent>
</Dialog>
```

---

### Sheet (Panel) (`ui/sheet.tsx`)
Yon panel. Mobil menyu uchun ishlatiladi.

```tsx
<Sheet open={ochiq} onOpenChange={setOchiq}>
  <SheetTrigger>Menyu</SheetTrigger>
  <SheetContent side="left">
    {/* Navigatsiya */}
  </SheetContent>
</Sheet>
```

---

### Avatar (`ui/avatar.tsx`)
Foydalanuvchi avatari.

---

### Separator (Ajratgich) (`ui/separator.tsx`)
Bo'luvchi chiziq.

---

### DropdownMenu (Ochiladigan Menyu) (`ui/dropdown-menu.tsx`)
Ochiladigan menyu.

---

### Label (Yorliq) (`ui/label.tsx`)
Forma yorlig'i.

---

### Textarea (Matn Maydoni) (`ui/textarea.tsx`)
Ko'p qatorli kiritish maydoni.

---

## 🚀 Asosiy Komponentlar

### Sidebar (Yon Panel) (`components/sidebar.tsx`)

Boshqaruv paneli uchun asosiy navigatsiya.

**Xususiyatlari:**
- Kompyuter: 72px kenglikdagi doimiy panel
- Mobil: Sheet komponenti (hamburger menyu)
- Qorong'i mavzu
- 7 ta navigatsiya havolasi
- Chiqish tugmasi
- Mavzu almashtirish

**Navigatsiya Elementlari:**
| Sarlavha | Havola | Ikonka |
|----------|--------|--------|
| Boshqaruv | /dashboard | LayoutDashboard |
| Buyurtmalar | /dashboard/orders | ClipboardList |
| Omborxona | /dashboard/warehouse | Warehouse |
| Mahsulotlar | /dashboard/products | Package |
| Kategoriyalar | /dashboard/categories | FolderOpen |
| Mijozlar | /dashboard/customers | Users |
| Sozlamalar | /dashboard/settings | Settings |

---

### SplashScreen (Yuklash Ekrani) (`components/splash-screen.tsx`)

Ilova yuklanayotganda ko'rsatiladigan ekran.

**Xususiyatlari:**
- Animatsiyali logo
- Yuklash ko'rsatkichi
- Qorong'i mavzu

---

## 📄 Boshqaruv Paneli Sahifalari

### Bosh Sahifa (`dashboard/page.tsx`)

Statistikalar bilan bosh sahifa.

**Ko'rsatiladi:**
- Jami buyurtmalar
- Daromad
- Mijozlar soni
- Mahsulotlar soni
- So'nggi buyurtmalar ro'yxati

---

### Buyurtmalar (`dashboard/orders/page.tsx`)

Buyurtmalar boshqaruvi.

**Xususiyatlari:**
- Buyurtmalar ro'yxati (jadval)
- Holat filtrlash
- Holatni o'zgartirish (ochiladigan menyu)
- Buyurtma tafsilotlari

---

### Mahsulotlar (`dashboard/products/page.tsx`)

Mahsulotlar boshqaruvi.

**Xususiyatlari:**
- Mahsulotlar ro'yxati (kartalar)
- Qo'shish modal oynasi
- Tahrirlash modal oynasi
- O'chirish
- Rasm yuklash (Cloudinary)
- Kategoriya tanlash

---

### Kategoriyalar (`dashboard/categories/page.tsx`)

Kategoriyalar boshqaruvi.

**Xususiyatlari:**
- Kategoriyalar ro'yxati
- Qo'shish modal oynasi
- Tahrirlash modal oynasi
- O'chirish
- Rang tanlash

---

### Omborxona (`dashboard/warehouse/page.tsx`)

Omborxona boshqaruvi.

**Xususiyatlari:**
- Ombor mahsulotlari ro'yxati
- Qo'shish/tahrirlash/o'chirish
- Kirim/chiqim qo'shish
- Harakatlar tarixi
- Kam qolgan mahsulotlar ogohlantirishi

---

### Mijozlar (`dashboard/customers/page.tsx`)

Mijozlar ro'yxati.

**Xususiyatlari:**
- Mijozlar jadvali
- Qidiruv
- Telefon, hudud, buyurtmalar soni

---

### Sozlamalar (`dashboard/settings/page.tsx`)

Sozlamalar sahifasi.

**Bo'limlar:**
1. **Profil** - Ism va elektron pochta tahrirlash
2. **Xavfsizlik** - Parol o'zgartirish
3. **Bildirishnomalar** - Almashtirish sozlamalari
4. **Ko'rinish** - Qorong'i/Yorug' mavzu

---

### Kirish (`login/page.tsx`)

Kirish sahifasi.

**Xususiyatlari:**
- Elektron pochta va parol formasi
- Xatolik ko'rsatish
- NextAuth credentials provayderi
- Boshqaruv paneliga yo'naltirish

---

## 🔧 Lib Modullari

| Fayl | Vazifasi |
|------|----------|
| `api-client.ts` | Tiplangan API mijoz (apiGet, apiPost, apiPatch, apiDelete) |
| `api-response.ts` | API javob yordamchilari |
| `auth.ts` | Autentifikatsiya yordamchi funksiyalari |
| `cloudinary.ts` | Cloudinary sozlamasi |
| `config.ts` | Ilova sozlamasi |
| `constants.ts` | Doimiylar |
| `date-utils.ts` | Sana formatlash (timeAgo, formatPrice) |
| `logger.ts` | Log yozish yordamchisi |
| `prisma.ts` | Prisma mijoz singleton |
| `store.ts` | Zustand holat (mavzu) |
| `utils.ts` | cn() yordamchisi (Tailwind merge) |
| `validation.ts` | Forma tekshiruvi |

---

*Oxirgi yangilanish: 2026-yil 9-yanvar*
