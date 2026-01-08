# Telegram Mini App Responsive Fix

## Muammo
Telegram Mini App'da dastur ochilganida, web app'da kattalashtirganda yaqinlashib qolayapti va to'liq moslashmagan (responsive emas).

## Tuzatilgan Muammolar

### 1. ✅ Viewport Meta Tag
**Fayl:** `web/src/app/layout.tsx`
- `viewportFit: 'cover'` - iPhone notch support
- `maximumScale: 5` - Zoom imkoniyati (avval 1 edi)
- `userScalable: true` - User zoom qila oladi
- `themeColor` - Theme color sozlandi
- `appleWebApp` - iOS PWA support

### 2. ✅ Telegram WebApp Script Integration
**Fayllar:**
- `web/src/app/layout.tsx` - Script qo'shildi
- `web/src/lib/telegram-webapp.ts` - Telegram WebApp API utilities
- `web/src/components/telegram-provider.tsx` - Provider component
- `web/src/app/providers.tsx` - Integration

**Features:**
- Telegram WebApp API initialization
- Viewport height tracking
- Theme color sync
- Platform detection

### 3. ✅ Responsive CSS Fixes
**Fayl:** `web/src/app/globals.css`

**O'zgarishlar:**
- Safe area support (iPhone notch)
- Overflow prevention
- Mobile-first responsive design
- Table overflow fix
- Image overflow fix
- Card overflow fix
- Viewport height CSS variables

### 4. ✅ Layout Overflow Fixes
**Fayl:** `web/src/app/dashboard/layout.tsx`
- `overflow-x-hidden` - Horizontal scroll prevention
- `max-w-full` - Max width constraint
- `w-full` - Full width support

## Qo'llash Qadamlar

### 1. Build va Deploy
```bash
cd web
npm run build
# Deploy to Dokploy/Vercel
```

### 2. Telegram Bot Settings (BotFather)
1. BotFather'da `/mybots` → NAVQURT bot'ni tanlang
2. **Bot Settings** → **Menu Button** yoki **Web App** bo'limiga o'ting
3. **Menu Button** yoki **Web App URL** ni sozlang:
   ```
   https://your-domain.com
   ```
4. **Save** qiling

### 3. Test
1. Telegram'da bot'ni oching
2. Menu button yoki `/start` buyrug'i bilan mini app'ni oching
3. Kattalashtirib test qiling
4. Responsive ishlashini tekshiring

## Qo'shimcha Sozlamalar

### Telegram Bot Settings (BotFather)
- **Menu Button:** `/setmenubutton` - Menu button sozlash
- **Web App URL:** `/setmenubuttonurl` - Web App URL sozlash
- **Domain:** Web App domain'ini whitelist qilish

### Environment Variables
Telegram Mini App uchun qo'shimcha env variable'lar yo'q, lekin Telegram WebApp API avtomatik ishlaydi.

## Muammo Tekshirish

### 1. Console Logs
Browser console'da quyidagilarni tekshiring:
```javascript
// Telegram WebApp mavjudmi?
window.Telegram?.WebApp

// Viewport height
window.Telegram?.WebApp?.viewportHeight

// Platform
window.Telegram?.WebApp?.platform
```

### 2. Network Tab
- `telegram-web-app.js` script yuklanayaptimi?
- Xato xabarlar bormi?

### 3. Responsive Test
- DevTools'da mobile view'da test qiling
- Turli ekran o'lchamlarni tekshiring
- Zoom qilib test qiling

## Yechilgan Muammolar

✅ **Horizontal scroll** - `overflow-x-hidden` bilan yechildi
✅ **Viewport height** - Telegram WebApp API bilan yechildi
✅ **Safe area** - iPhone notch support qo'shildi
✅ **Responsive design** - Mobile-first approach qo'shildi
✅ **Table overflow** - Scrollable table qo'shildi
✅ **Image overflow** - Max-width constraint qo'shildi

## Keyingi Qadamlar (Optional)

1. **Telegram Theme Integration** - Telegram theme ranglarini qo'llash
2. **Haptic Feedback** - Button click'da haptic feedback
3. **Back Button** - Telegram back button integration
4. **Main Button** - Telegram main button integration
5. **Share Data** - Telegram'ga ma'lumot yuborish

## Test Buyruqlar

```bash
# Local development
cd web
npm run dev

# Build
npm run build

# Test production build
npm start
```

## Xatolar

Agar muammo davom etsa:

1. **Browser Cache** - Cache'ni tozalang
2. **Telegram Cache** - Telegram'da bot'ni qayta oching
3. **Console Errors** - Browser console'da xatolarni tekshiring
4. **Network** - Script yuklanayaptimi tekshiring
