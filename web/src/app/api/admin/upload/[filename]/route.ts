import { NextRequest, NextResponse } from "next/server"
import { unlink } from "fs/promises"
import { existsSync } from "fs"
import path from "path"
import { assertAdmin } from "@/lib/api-auth"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ filename: string }> }
) {
    try {
        await assertAdmin(request)
        const { filename } = await params

        // Validate filename (prevent directory traversal)
        if (filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
            return NextResponse.json({ error: "Noto'g'ri fayl nomi" }, { status: 400 })
        }

        const filepath = path.join(UPLOAD_DIR, filename)

        if (!existsSync(filepath)) {
            return NextResponse.json({ error: "Fayl topilmadi" }, { status: 404 })
        }

        await unlink(filepath)

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        console.error("Delete error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Faylni o'chirishda xatolik" },
            { status: 500 }
        )
    }
}
