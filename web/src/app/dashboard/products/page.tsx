"use client"

import { useState, useEffect, useRef } from "react"
import { Plus, Edit2, Trash2, Upload, X, Image as ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { apiGet, apiPost, apiPatch, apiDelete, apiPostFormData, handleApiError } from "@/lib/api-client"
import { logError } from "@/lib/logger"

interface Category {
    id: string
    name: string
    color: string | null
}

interface Product {
    id: string
    name: string
    description?: string
    image?: string // URL (can be /api/images/[id] or external URL)
    imagePublicId?: string // Deprecated: kept for backward compatibility
    imageId?: string // New: database image ID
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
        imagePublicId: "", // Deprecated: kept for backward compatibility
        imageId: "" // New: database image ID
    })
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const data = await apiGet<{ products: Product[] }>("/api/admin/products")
            setProducts(data.products ?? [])
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch products:", errorMessage)
            alert(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const data = await apiGet<{ categories: Category[] }>("/api/admin/categories")
            setCategories(data.categories ?? [])
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch categories:", errorMessage)
        }
    }

    const handleImageUpload = async (file: File) => {
        setUploading(true)
        try {
            const formDataUpload = new FormData()
            formDataUpload.append("file", file)

            const data = await apiPostFormData<{ url: string; public_id: string }>(
                "/api/admin/upload",
                formDataUpload
            )
            
            // Extract imageId from URL if it's /api/images/[id] format
            const imageId = data.url.startsWith('/api/images/') 
                ? data.url.replace('/api/images/', '')
                : null
            
            setFormData(prev => ({
                ...prev,
                image: data.url, // Full URL (can be /api/images/[id] or external)
                imagePublicId: data.public_id, // Keep for backward compatibility
                imageId: imageId || data.public_id // Use imageId if available, otherwise public_id
            }))
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to upload image:", errorMessage)
            alert(errorMessage)
        } finally {
            setUploading(false)
        }
    }

    const handleRemoveImage = async () => {
        // Use imageId if available, otherwise imagePublicId (backward compatibility)
        const publicId = formData.imageId || formData.imagePublicId
        if (publicId) {
            try {
                await apiPost<{ message: string }>("/api/admin/upload/delete", {
                    public_id: publicId
                })
            } catch (error) {
                logError("Failed to delete image:", handleApiError(error))
            }
        }
        setFormData(prev => ({ ...prev, image: "", imagePublicId: "", imageId: "" }))
    }

    const handleAdd = async () => {
        try {
            await apiPost<{ data: Product }>("/api/admin/products", formData)
            await fetchProducts()
            setIsAddOpen(false)
            setFormData({ name: "", description: "", price: "", weight: "", categoryIds: [], image: "", imagePublicId: "", imageId: "" })
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to add product:", errorMessage)
            alert(errorMessage)
        }
    }

    const handleEdit = async () => {
        if (!selectedProduct) return
        try {
            await apiPatch<{ data: Product }>(`/api/admin/products/${selectedProduct.id}`, formData)
            await fetchProducts()
            setIsEditOpen(false)
            setSelectedProduct(null)
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to edit product:", errorMessage)
            alert(errorMessage)
        }
    }

    const handleDelete = async (id: string) => {
        const product = products.find(p => p.id === id)
        if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return

        // Delete image from database or storage if exists
        const publicId = product?.imageId || product?.imagePublicId
        if (publicId) {
            try {
                await apiPost<{ message: string }>("/api/admin/upload/delete", {
                    public_id: publicId
                })
            } catch (error) {
                logError("Failed to delete image:", handleApiError(error))
            }
        }

        try {
            await apiDelete<{ message: string }>(`/api/admin/products/${id}`)
            await fetchProducts()
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to delete product:", errorMessage)
            alert(errorMessage)
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
            imagePublicId: product.imagePublicId || "",
            imageId: product.imageId || ""
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

    // ProductForm JSX - inline render qilamiz fokus yo'qolmasligi uchun
    const productFormJSX = (
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
                                    <span className="text-slate-500 text-xs mt-1">PostgreSQL Database (JPEG, PNG, WebP)</span>
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
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div>
                <Label>Tavsif</Label>
                <Input
                    className="bg-slate-800 border-slate-700"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    autoComplete="off"
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label>Narx (so&apos;m)</Label>
                    <Input
                        type="number"
                        className="bg-slate-800 border-slate-700"
                        value={formData.price}
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                        autoComplete="off"
                    />
                </div>
                <div>
                    <Label>Og&apos;irlik (g)</Label>
                    <Input
                        type="number"
                        className="bg-slate-800 border-slate-700"
                        value={formData.weight}
                        onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
                        autoComplete="off"
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
        <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-white">Mahsulotlar</h1>
                    <p className="text-slate-400 text-sm md:text-base">Barcha mahsulotlarni boshqaring</p>
                </div>
                <div className="flex items-center gap-3">
                    <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                        <DialogTrigger asChild>
                            <button
                                onClick={() => setFormData({ name: "", description: "", price: "", weight: "", categoryIds: [], image: "", imagePublicId: "", imageId: "" })}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 text-sm rounded-xl flex items-center gap-2 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span className="hidden sm:inline">Qo&apos;shish</span>
                                <span className="sm:hidden">+</span>
                            </button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md mx-auto">
                            <DialogHeader>
                                <DialogTitle>Yangi mahsulot</DialogTitle>
                            </DialogHeader>
                            {productFormJSX}
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
                <DialogContent className="bg-slate-900 border-slate-800 text-white max-h-[90vh] overflow-y-auto max-w-[95vw] sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
                    </DialogHeader>
                    {productFormJSX}
                    <Button onClick={handleEdit} className="w-full bg-blue-500 hover:bg-blue-600">
                        Saqlash
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    )
}
