import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
    try {
        // Delete existing admin user if exists
        await prisma.user.deleteMany({
            where: { email: "admin@navqurt.uz" }
        })

        // Create admin user with hashed password
        const hashedPassword = await bcrypt.hash("admin123", 10)

        const admin = await prisma.user.create({
            data: {
                email: "admin@navqurt.uz",
                password: hashedPassword,
                name: "Admin Navqurt",
                role: "admin"
            }
        })

        return NextResponse.json({
            success: true,
            message: "Admin foydalanuvchi yaratildi",
            user: {
                email: admin.email,
                name: admin.name
            }
        })
    } catch (error) {
        console.error("Seed error:", error)
        return NextResponse.json(
            { success: false, error: String(error) },
            { status: 500 }
        )
    }
}

export async function GET() {
    return NextResponse.json({
        message: "POST so'rov yuboring admin yaratish uchun"
    })
}
