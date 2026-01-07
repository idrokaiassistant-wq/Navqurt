import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST() {
    // Vaqtincha productionda ruxsat berildi
    /* if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: "Not Found" }, { status: 404 });
    } */
    try {
        if (!prisma) {
            return NextResponse.json(
                { success: false, error: "DATABASE_URL yo'q. DB sozlang, so'ng seed qiling." },
                { status: 500 }
            )
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
    if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ message: "Not Found" }, { status: 404 });
    }
    return NextResponse.json({
        message: "POST so'rov yuboring admin yaratish uchun"
    })
}
