import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
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

    console.log("✅ Admin foydalanuvchi yaratildi:")
    console.log(`   Email: ${admin.email}`)
    console.log(`   Parol: admin123`)
}

main()
    .catch((e) => {
        console.error("❌ Xatolik:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
