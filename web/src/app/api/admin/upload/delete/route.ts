import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
    try {
        await assertAdmin(request)
        const { public_id } = await request.json()

        if (!public_id) {
            return NextResponse.json({ error: "public_id topilmadi" }, { status: 400 })
        }

        const result = await cloudinary.uploader.destroy(public_id)

        if (result.result !== 'ok') {
            return NextResponse.json({ error: "Rasmni o'chirishda xatolik", detail: result }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        console.error("Delete error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Rasmni o'chirishda xatolik" },
            { status: 500 }
        )
    }
}
