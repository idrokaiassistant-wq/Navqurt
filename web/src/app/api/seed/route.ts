import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { withApiErrorHandler, successResponse, notFoundResponse, messageResponse } from "@/lib/api-response"

export async function POST() {
    if (process.env.NODE_ENV === 'production') {
        return notFoundResponse("Not Found")
    }

    return withApiErrorHandler(async () => {
        if (!prisma) {
            throw new Error("DATABASE_URL yo'q. DB sozlang, so'ng seed qiling.")
        }

        // Delete existing admin user if exists
        await prisma.adminUser.deleteMany({
            where: { email: "admin@navqurt.uz" }
        })

        // Create admin user with hashed password
        const hashedPassword = await bcrypt.hash("admin123", 10)

        const admin = await prisma.adminUser.create({
            data: {
                email: "admin@navqurt.uz",
                passwordHash: hashedPassword,
                name: "Admin Navqurt",
                role: "admin"
            }
        })

        return successResponse({
            message: "Admin foydalanuvchi yaratildi",
            user: {
                email: admin.email,
                name: admin.name
            }
        })
    })
}

export async function GET() {
    if (process.env.NODE_ENV === 'production') {
        return notFoundResponse("Not Found")
    }
    return messageResponse("POST so'rov yuboring admin yaratish uchun")
}
