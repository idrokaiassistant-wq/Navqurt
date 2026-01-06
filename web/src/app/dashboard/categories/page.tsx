"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus, Search, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type ApiCategory = {
    id: string
    name: string
    color: string | null
    createdAt: string
}

export default function CategoriesPage() {
    const [categories, setCategories] = useState<ApiCategory[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    const [query, setQuery] = useState("")
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newCategory, setNewCategory] = useState({ name: "", color: "" })

    const load = async () => {
        setLoading(true)
        setError("")
        try {
            const res = await fetch("/api/admin/categories", { cache: "no-store" })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error ?? "Xatolik")
            setCategories(data.categories ?? [])
        } catch (e) {
            setError(String(e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        void load()
    }, [])

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return categories
        return categories.filter((c) => c.name.toLowerCase().includes(q))
    }, [categories, query])

    const handleAdd = async () => {
        try {
            const payload = {
                name: newCategory.name.trim(),
                color: newCategory.color.trim() || null,
            }
            const res = await fetch("/api/admin/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data?.error ?? "Xatolik")
            setNewCategory({ name: "", color: "" })
            setIsAddOpen(false)
            await load()
        } catch (e) {
            setError(String(e))
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Kategoriyalar</h1>
                    <p className="text-slate-400">Mahsulot kategoriyalarini boshqaring</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            className="bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 hover:bg-blue-600">
                                <Plus className="h-5 w-5 mr-2" />
                                Yangi kategoriya
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white">
                            <DialogHeader>
                                <DialogTitle>Yangi kategoriya</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Nomi</Label>
                                    <Input
                                        className="bg-slate-800 border-slate-700"
                                        value={newCategory.name}
                                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Rang class (ixtiyoriy)</Label>
                                    <Input
                                        className="bg-slate-800 border-slate-700"
                                        placeholder="masalan: bg-blue-500"
                                        value={newCategory.color}
                                        onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleAdd} className="w-full bg-blue-500 hover:bg-blue-600">
                                    Qo&apos;shish
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {error && (
                    <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-5 text-rose-400 col-span-full">
                        {error}
                    </div>
                )}
                {loading && !error && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-400 col-span-full">
                        Yuklanmoqda...
                    </div>
                )}
                {!loading && !error && filtered.length === 0 && (
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 text-slate-400 col-span-full">
                        Kategoriya topilmadi
                    </div>
                )}
                {filtered.map((cat) => (
                    <div key={cat.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 ${cat.color ?? "bg-slate-700"} rounded-xl flex items-center justify-center`}>
                                    <span className="text-white text-xl">📁</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">{cat.name}</h3>
                                    <p className="text-slate-400 text-sm">ID: {cat.id.slice(0, 8)}...</p>
                                </div>
                            </div>
                            <button
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                onClick={async () => {
                                    if (!confirm(`"${cat.name}" kategoriyasini o'chirmoqchimisiz?`)) return
                                    try {
                                        const res = await fetch(`/api/admin/categories/${cat.id}`, { method: "DELETE" })
                                        if (!res.ok) throw new Error("Xatolik")
                                        await load()
                                    } catch (e) {
                                        setError(String(e))
                                    }
                                }}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                            <span className="text-slate-400">Yaratilgan</span>
                            <span className="text-white font-semibold">{new Date(cat.createdAt).toLocaleDateString("uz-UZ")}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
