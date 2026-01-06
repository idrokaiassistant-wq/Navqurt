import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    console.log("🌱 Database seed boshlandi...")

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

    console.log("✅ Admin foydalanuvchi yaratildi:")
    console.log(`   Email: ${admin.email}`)
    console.log(`   Parol: admin123`)
    console.log("✅ Database seed yakunlandi!")
}

main()
    .catch((e) => {
        console.error("❌ Xatolik:", e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
