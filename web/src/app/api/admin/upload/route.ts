```typescript
import { NextRequest, NextResponse } from "next/server"
import { assertAdmin } from "@/lib/api-auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: NextRequest) {
    try {
        await assertAdmin(request)

        const formData = await request.formData()
        const file = formData.get("file") as File | null

        if (!file) {
            return NextResponse.json({ error: "Fayl topilmadi" }, { status: 400 })
        }

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: "Faqat rasm fayllari ruxsat etilgan (JPEG, PNG, WebP, GIF)" }, { status: 400 })
        }

        // Validate file size (max 5MB)
        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: "Fayl hajmi 5MB dan oshmasligi kerak" }, { status: 400 })
        }

        // Convert file to Buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary using promise
        const uploadResponse = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: "navqurt_products",
                    resource_type: "auto",
                },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            ).end(buffer);
        }) as any;

        return NextResponse.json({ 
            url: uploadResponse.secure_url, 
            public_id: uploadResponse.public_id 
        })
    } catch (error: unknown) {
        if (error instanceof Error && error.message === "Unauthorized") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }
        console.error("Upload error:", error)
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Fayl yuklashda xatolik" },
            { status: 500 }
        )
    }
}
