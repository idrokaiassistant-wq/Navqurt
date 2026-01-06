import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { assertAdmin } from "@/lib/api-auth"

export async function GET(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.response

  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL yo'q" }, { status: 500 })
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
  })
  return NextResponse.json({ categories })
}

export async function POST(req: NextRequest) {
  const auth = await assertAdmin(req)
  if (!auth.ok) return auth.response

  if (!prisma) {
    return NextResponse.json({ error: "DATABASE_URL yo'q" }, { status: 500 })
  }

  const body = await req.json().catch(() => ({}))
  const name = String(body?.name ?? "").trim()
  const color = body?.color ? String(body.color) : null

  if (!name) {
    return NextResponse.json({ error: "name majburiy" }, { status: 400 })
  }

  const category = await prisma.category.create({
    data: { name, color: color || null },
  })

  return NextResponse.json({ category }, { status: 201 })
}




