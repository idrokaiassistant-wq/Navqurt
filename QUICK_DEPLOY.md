# Tezkor Deploy Qo'llanmasi

## 1. GitHub'ga Push

```bash
git add .
git commit -m "Deploy tayyor"
git push origin main
```

## 2. Dokploy'da Sozlash

### Environment Variables (Majburiy):

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
NEXTAUTH_SECRET=<openssl rand -base64 32 natijasi>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Service Sozlamalari:

- **Type**: Docker
- **Build Context**: `.`
- **Dockerfile**: `web/Dockerfile`
- **Port**: `3000`

## 3. Deploy Qilish

1. Dokploy'da "Deploy" tugmasini bosing
2. Yoki GitHub'ga push qiling (auto deploy)

## 4. Post-Deploy (Container ichida)

```bash
# Container'ga kirish
docker exec -it <container-name> sh

# Migration
cd /app && npx prisma migrate deploy

# Seed (Admin user)
cd /app && npx prisma db seed
```

Yoki Dokploy'da "Execute Command":

```bash
cd /app && npx prisma migrate deploy && npx prisma db seed
```

## 5. Test

1. Health: `https://your-domain.com/api/health`
2. Login: `https://your-domain.com/login`
   - Email: `admin@navqurt.uz`
   - Parol: `admin123`

## Muammo Bo'lsa

1. Container log'larni tekshiring
2. Health check: `/api/health`
3. Database connection tekshiring
4. Environment variables tekshiring




