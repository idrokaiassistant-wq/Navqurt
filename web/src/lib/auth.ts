export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET
  if (secret) return secret

  // Dev fallback: local developmentni osonlashtirish uchun
  if (process.env.NODE_ENV !== "production") return "dev-nextauth-secret"

  throw new Error("NEXTAUTH_SECRET production muhitida majburiy")
}

export const DEV_ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@navqurt.uz"
export const DEV_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123"


