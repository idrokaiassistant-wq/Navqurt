"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Edit2, Trash2, Upload, X, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"

interface Category {
    id: string
    name: string
    color: string | null
}

interface Product {
    id: string
    name: string
    description?: string
    image?: string
    imagePublicId?: string
    price: number
    weight: number
    isActive: boolean
    createdAt: string
    categoryIds?: string[]
    categoryNames?: string[]
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        weight: "",
        categoryIds: [] as string[],
        image: "",
        imagePublicId: ""
    })
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        try {
            const res = await fetch("/api/admin/products", { cache: "no-store" })
            if (res.ok) {
                const data = await res.json()
                setProducts(data.products ?? [])
            } else {
                const errorData = await res.json().catch(() => ({}))
                console.error("Failed to fetch products:", errorData.error || "Xatolik")
            }
        } catch (error) {
            console.error("Failed to fetch products:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const res = await fetch("/api/admin/categories", { cache: "no-store" })
            if (res.ok) {
                const data = await res.json()
                setCategories(data.categories ?? [])
            }
        } catch (error) {
            console.error("Failed to fetch categories:", error)
        }
    }

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append("file", file)

            const res = await fetch("/api/admin/upload", {
                method: "POST",
                body: formDataUpload
            })

            if (res.ok) {
                const data = await res.json()
                setFormData(prev => ({
                    ...prev,
                    image: data.url,
                    imagePublicId: data.public_id
                }))
            } else {
                const error = await res.json()
                alert(error.error || "Rasm yuklashda xatolik")
            }
        } catch (error) {
            console.error("Failed to upload image:", error)
            alert("Rasm yuklashda xatolik")
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveImage = async () => {
        if (formData.imagePublicId) {
            try {
                // Bizda delete uchun endpoint /api/admin/upload/[filename] (u hozir public_id qabul qilyapti)
                // Lekin u POST metodini kutyapti (Cloudinary destroy uchun)
                await fetch(`/api/admin/upload/delete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ public_id: formData.imagePublicId })
                })
            } catch (error) {
                console.error("Failed to delete image:", error)
            }
            setFormData(prev => ({ ...prev, image: "", imagePublicId: "" }))
        } else {
            setFormData(prev => ({ ...prev, image: "", imagePublicId: "" }))
        }
    }

    const handleAdd = async () => {
        try {
            const res = await fetch("/api/admin/products", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                await fetchProducts()
                setIsAddOpen(false)
                setFormData({ name: "", description: "", price: "", weight: "", categoryIds: [], image: "", imagePublicId: "" })
            }
        } catch (error) {
            console.error("Failed to add product:", error)
        }
    }

    const handleEdit = async () => {
        if (!selectedProduct) return
        try {
            const res = await fetch(`/api/admin/products/${selectedProduct.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                await fetchProducts()
                setIsEditOpen(false)
                setSelectedProduct(null)
            }
        } catch (error) {
            console.error("Failed to edit product:", error)
        }
    }

    const handleDelete = async (id: string) => {
        const product = products.find(p => p.id === id)
        if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return

        // Delete image from Cloudinary if exists
        if (product?.imagePublicId) {
            try {
                await fetch(`/api/admin/upload/delete`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ public_id: product.imagePublicId })
                })
            } catch (error) {
                console.error("Failed to delete image:", error)
            }
        }

        try {
            const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
            if (res.ok) {
                await fetchProducts()
            }
        } catch (error) {
            console.error("Failed to delete product:", error)
        }
    }

    const openEditModal = (product: Product) => {
        setSelectedProduct(product)
        setFormData({
            name: product.name,
            description: product.description || "",
            price: product.price.toString(),
            weight: product.weight.toString(),
            categoryIds: product.categoryIds || [],
            image: product.image || "",
            imagePublicId: product.imagePublicId || ""
        })
        setIsEditOpen(true)
    }

    const toggleCategory = (categoryId: string) => {
        setFormData(prev => ({
            ...prev,
            categoryIds: prev.categoryIds.includes(categoryId)
                ? prev.categoryIds.filter(id => id !== categoryId)
                : [...prev.categoryIds, categoryId]
        }))
    }

    if (loading) {
        return <div className="text-white">Yuklanmoqda...</div>
    }

    const ProductForm = () => (
        <div className="space-y-4">
            {/* Image Upload */}
            <div>
                <Label>Mahsulot rasmi</Label>
                <div className="mt-2">
                    {formData.image ? (
                        <div className="relative w-full h-40 bg-slate-800 rounded-xl overflow-hidden">
                            <Image
                                src={formData.image}
                                alt="Product"
                                fill
                                className="object-cover"
                            />
                            <button
                                type="button"
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-40 bg-slate-800 border-2 border-dashed border-slate-600 rounded-xl cursor-pointer hover:border-blue-500 transition-colors">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0]
                                    if (file) handleImageUpload(file)
                                }}
                            />
                            {uploading ? (
                                <div className="text-slate-400">Yuklanmoqda...</div>
                            ) : (
                                <>
                                    <Upload className="h-8 w-8 text-slate-400 mb-2" />
                                    <span className="text-slate-400 text-sm">Rasm yuklash uchun bosing</span>
                                    <span className="text-slate-500 text-xs mt-1">Cloudinary (JPEG, PNG, WebP)</span>
                                </>
                            )}
                        </label>
                    )}
                </div>
            </div>

            <div>
                <Label>Nomi</Label>
                <Input
                    className="bg-slate-800 border-slate-700"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
            </div>
            <div>
                <Label>Tavsif</Label>
                <Input
                    className="bg-slate-800 border-slate-700"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Narx (so&apos;m)</Label>
                    <Input
                        type="number"
                        className="bg-slate-800 border-slate-700"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    />
                </div>
                <div>
                    <Label>Og&apos;irlik (g)</Label>
                    <Input
                        type="number"
                        className="bg-slate-800 border-slate-700"
                        value={formData.weight}
                        onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    />
                </div>
            </div>
            <div>
                <Label>Kategoriyalar</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            type="button"
                            onClick={() => toggleCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${formData.categoryIds.includes(cat.id)
                                    ? "bg-blue-500 text-white"
                                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                    {categories.length === 0 && (
                        <span className="text-slate-400 text-sm">Kategoriyalar mavjud emas</span>
                    )}
                </div>
            </div>
        </div>
    )

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Mahsulotlar</h1>
                    <p className="text-slate-400">Barcha mahsulotlarni boshqaring</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => setFormData({ name: "", description: "", price: "", weight: "", categoryIds: [], image: "", imagePublicId: "" })}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                                Qo&apos;shish
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Yangi mahsulot</DialogTitle>
                            </DialogHeader>
                            <ProductForm />
                            <Button onClick={handleAdd} className="w-full bg-blue-500 hover:bg-blue-600">
                                Qo&apos;shish
                            </Button>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((product) => (
                    <div key={product.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                        {/* Product Image */}
                        <div className="relative w-full h-40 bg-slate-800">
                            {product.image ? (
                                <Image
                                    src={product.image}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <ImageIcon className="h-12 w-12 text-slate-600" />
                                </div>
                            )}
                        </div>

                        <div className="p-5">
                            <div className="flex items-start justify-between mb-2">
                                <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => openEditModal(product)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <p className="text-2xl font-bold text-white mb-2">
                                {product.price.toLocaleString()} <span className="text-sm text-slate-400">so&apos;m</span>
                            </p>
                            <div className="text-sm text-slate-400 mb-3">
                                Og&apos;irlik: <span className="text-white">{product.weight}g</span>
                            </div>
                            {product.categoryNames && product.categoryNames.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {product.categoryNames.map((name, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-slate-700 rounded-lg text-xs text-slate-300">
                                            {name}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Edit Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
                    </DialogHeader>
                    <ProductForm />
                    <Button onClick={handleEdit} className="w-full bg-blue-500 hover:bg-blue-600">
                        Saqlash
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}
