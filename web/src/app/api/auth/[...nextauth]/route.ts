import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { DEV_ADMIN_EMAIL, DEV_ADMIN_PASSWORD, getAuthSecret } from "@/lib/auth"

const handler = NextAuth({
    secret: getAuthSecret(),
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Email va parol kiritilishi shart")
                }

                // Agar DB sozlanmagan bo'lsa (dev), env orqali admin login
                if (!prisma) {
                    if (
                        credentials.email === DEV_ADMIN_EMAIL &&
                        credentials.password === DEV_ADMIN_PASSWORD
                    ) {
                        return {
                            id: "dev-admin",
                            email: DEV_ADMIN_EMAIL,
                            name: "Admin",
                            role: "admin"
                        }
                    }

                    throw new Error("DATABASE_URL yo'q. Dev uchun ADMIN_EMAIL/ADMIN_PASSWORD bilan kiring.")
                }

                const user = await prisma.adminUser.findUnique({
                    where: { email: credentials.email }
                })

                if (!user) {
                    throw new Error("Foydalanuvchi topilmadi")
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    user.passwordHash
                )

                if (!isPasswordValid) {
                    throw new Error("Parol noto'g'ri")
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role
                }
            }
        })
    ],
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/login"
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.role = token.role as string
            }
            return session
        }
    }
})

export { handler as GET, handler as POST }
