# Workflow Qoidalari

## Xatoliklarni To'g'rilashdan Keyin GitHub'ga Push Qilish

**Qat'iy qoida**: Har safar xatoliklarni to'g'rilagandan keyin o'zgarishlarni GitHub'ga push qilish **majburiy**.

### Jarayon

1. **Xatolikni aniqlash va tuzatish**
   - Xatolikni topish
   - To'g'ri yechimni amalga oshirish
   - Lint xatolarini tekshirish

2. **Commit va Push**
   - O'zgarishlarni `git add` qilish
   - Ma'qul commit message bilan commit qilish
   - `git push` qilish

### Commit Message Formati

```
fix: [qisqa tavsif]

Masalan:
fix: Kategoriyalar API xatoliklarini tuzatish - assertAdmin try-catch bilan handle qilindi
```

### Misol

```bash
git add web/src/app/api/admin/categories/route.ts
git commit -m "fix: Kategoriyalar API xatoliklarini tuzatish - assertAdmin try-catch bilan handle qilindi"
git push
```

---

**Eslatma**: Bu qoida har bir xatolik tuzatilgandan keyin avtomatik bajarilishi kerak.



