"use client"

import { useState, useEffect } from "react"
import { timeAgo, formatPrice } from "@/lib/date-utils"
import { Package, TrendingDown, TrendingUp, DollarSign, AlertTriangle, Plus, Edit2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiGet, apiPost, apiPatch, apiDelete, handleApiError } from "@/lib/api-client"
import { logError } from "@/lib/logger"

interface StockItem {
    id: string
    name: string
    current: number
    unit: string
    minRequired: number
    price: number
    updatedAt: string
}

interface StockMovement {
    id: string
    type: string
    itemId: string
    amount: number
    price: number | null
    date: string
    note?: string | null
    stockItem: StockItem
}

export default function WarehousePage() {
    const [stockItems, setStockItems] = useState<StockItem[]>([])
    const [movements, setMovements] = useState<StockMovement[]>([])
    const [loading, setLoading] = useState(true)
    const [isAddItemOpen, setIsAddItemOpen] = useState(false)
    const [isAddMovementOpen, setIsAddMovementOpen] = useState(false)
    const [isEditItemOpen, setIsEditItemOpen] = useState(false)
    const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
    const [movementType, setMovementType] = useState<'in' | 'out'>('in')
    const [newItem, setNewItem] = useState({ name: '', current: '', unit: 'kg', minRequired: '', price: '' })
    const [newMovement, setNewMovement] = useState({ itemId: '', amount: '', price: '', note: '' })

    useEffect(() => {
        fetchData(true) // Show loading on initial load
    }, [])

    const fetchData = async (showLoading = false) => {
        try {
            if (showLoading) {
                setLoading(true)
            }
            const [itemsData, movementsData] = await Promise.all([
                apiGet<{ items: StockItem[] }>("/api/admin/warehouse/items"),
                apiGet<{ movements: StockMovement[] }>("/api/admin/warehouse/movements")
            ])
            setStockItems(Array.isArray(itemsData.items) ? itemsData.items : [])
            setMovements(Array.isArray(movementsData.movements) ? movementsData.movements : [])
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to fetch warehouse data:", errorMessage)
        } finally {
            if (showLoading) {
                setLoading(false)
            }
        }
    }

    const addStockItem = async (item: Omit<StockItem, 'id' | 'updatedAt'>) => {
        try {
            await apiPost<StockItem>("/api/admin/warehouse/items", item)
            await fetchData()
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to add stock item:", errorMessage)
        }
    }

    const updateStockItem = async (id: string, updates: Partial<StockItem>) => {
        try {
            await apiPatch<StockItem>(`/api/admin/warehouse/items/${id}`, updates)
            await fetchData()
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to update stock item:", errorMessage)
        }
    }

    const deleteStockItem = async (id: string) => {
        if (!confirm("Mahsulotni o'chirmoqchimisiz?")) return
        try {
            await apiDelete<{ message: string }>(`/api/admin/warehouse/items/${id}`)
            await fetchData()
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to delete stock item:", errorMessage)
        }
    }

    const addMovement = async (movement: { type: string; itemId: string; amount: number; price: number | null; note: string }) => {
        try {
            await apiPost<StockMovement>("/api/admin/warehouse/movements", movement)
            // Fetch fresh data after successful movement creation
            await fetchData()
        } catch (error) {
            const errorMessage = handleApiError(error)
            logError("Failed to add movement:", errorMessage)
            alert(errorMessage) // Show error to user
            throw error // Re-throw to allow caller to handle
        }
    }

    const lowStockItems = stockItems.filter(item => item.current <= item.minRequired)
    const totalStock = stockItems.reduce((acc, item) => item.unit === 'kg' ? acc + item.current : acc, 0)

    // Calculate this month's statistics
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    startOfMonth.setHours(0, 0, 0, 0) // Set to start of day

    const thisMonthMovements = movements.filter(m => {
        const movementDate = new Date(m.date)
        movementDate.setHours(0, 0, 0, 0) // Normalize to start of day
        return movementDate >= startOfMonth
    })

    const thisMonthIn = thisMonthMovements
        .filter(m => m.type === 'IN')
        .reduce((acc, m) => {
            // Only count if unit is 'kg' and stockItem exists
            if (m.stockItem?.unit === 'kg') {
                return acc + m.amount
            }
            return acc
        }, 0)

    const thisMonthOut = thisMonthMovements
        .filter(m => m.type === 'OUT')
        .reduce((acc, m) => {
            // Only count if unit is 'kg' and stockItem exists
            if (m.stockItem?.unit === 'kg') {
                return acc + m.amount
            }
            return acc
        }, 0)

    const totalExpenses = thisMonthMovements
        .filter(m => m.type === 'IN' && m.price)
        .reduce((acc, m) => acc + (m.price || 0), 0)

    const handleAddItem = () => {
        if (newItem.name) {
            addStockItem({
                name: newItem.name,
                current: Number(newItem.current) || 0,
                unit: newItem.unit,
                minRequired: Number(newItem.minRequired) || 0,
                price: Number(newItem.price) || 0
            })
            setNewItem({ name: '', current: '', unit: 'kg', minRequired: '', price: '' })
            setIsAddItemOpen(false)
        }
    }

    const handleEditItem = () => {
        if (selectedItem) {
            updateStockItem(selectedItem.id, selectedItem)
            setIsEditItemOpen(false)
            setSelectedItem(null)
        }
    }

    const handleAddMovement = async () => {
        const amount = Number(newMovement.amount) || 0
        if (newMovement.itemId && amount > 0) {
            try {
                await addMovement({
                    type: movementType === 'in' ? 'IN' : 'OUT',
                    itemId: newMovement.itemId,
                    amount: amount,
                    price: movementType === 'in' ? (Number(newMovement.price) || 0) : null,
                    note: newMovement.note
                })
                // Reset form and close modal only after successful API call
                setNewMovement({ itemId: '', amount: '', price: '', note: '' })
                setIsAddMovementOpen(false)
            } catch {
                // Error is already handled in addMovement function
                // Don't close modal if there's an error
            }
        }
    }

    const openEditModal = (item: StockItem) => {
        setSelectedItem({ ...item })
        setIsEditItemOpen(true)
    }

    if (loading) {
        return <div className="text-foreground">Yuklanmoqda...</div>
    }

    return (
        <div className="space-y-4 md:space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl md:text-2xl font-bold text-foreground">Omborxona</h1>
                    <p className="text-muted-foreground text-sm md:text-base">Mahsulot qoldiqlari va xarajatlarni boshqaring</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                    {/* Add Stock Item */}
                    <Dialog open={isAddItemOpen} onOpenChange={setIsAddItemOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-blue-500 hover:bg-blue-600 text-sm px-3 py-2">
                                <Plus className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Mahsulot qo&apos;shish</span>
                                <span className="sm:hidden">Qo&apos;shish</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
                            <DialogHeader>
                                <DialogTitle>Yangi mahsulot qo&apos;shish</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div>
                                    <Label>Nomi</Label>
                                    <Input
                                        value={newItem.name}
                                        onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Miqdori</Label>
                                        <Input
                                            type="number"
                                            value={newItem.current}
                                            onChange={(e) => setNewItem({ ...newItem, current: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Birlik</Label>
                                        <select
                                            className="w-full bg-input border border-input rounded-md p-2 text-foreground"
                                            value={newItem.unit}
                                            onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                                        >
                                            <option value="kg">kg</option>
                                            <option value="dona">dona</option>
                                            <option value="rulon">rulon</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label>Minimum</Label>
                                        <Input
                                            type="number"
                                            value={newItem.minRequired}
                                            onChange={(e) => setNewItem({ ...newItem, minRequired: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <Label>Narx (1 birlik)</Label>
                                        <Input
                                            type="number"
                                            value={newItem.price}
                                            onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleAddItem} className="w-full bg-blue-500 hover:bg-blue-600">
                                    Qo&apos;shish
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Add Movement */}
                    <Dialog open={isAddMovementOpen} onOpenChange={setIsAddMovementOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="text-sm px-3 py-2">
                                <TrendingUp className="h-4 w-4 sm:mr-2" />
                                <span className="hidden sm:inline">Kirim/Chiqim</span>
                                <span className="sm:hidden">Kirim</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
                            <DialogHeader>
                                <DialogTitle>Kirim yoki Chiqim qo&apos;shish</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                                <div className="flex gap-2">
                                    <Button
                                        onClick={() => setMovementType('in')}
                                        className={movementType === 'in' ? 'bg-emerald-500' : 'bg-muted'}
                                    >
                                        <TrendingUp className="h-4 w-4 mr-2" />
                                        Kirim
                                    </Button>
                                    <Button
                                        onClick={() => setMovementType('out')}
                                        className={movementType === 'out' ? 'bg-rose-500' : 'bg-muted'}
                                    >
                                        <TrendingDown className="h-4 w-4 mr-2" />
                                        Chiqim
                                    </Button>
                                </div>
                                <div>
                                    <Label>Mahsulot</Label>
                                    <select
                                        className="w-full bg-input border border-input rounded-md p-2 text-foreground"
                                        value={newMovement.itemId}
                                        onChange={(e) => setNewMovement({ ...newMovement, itemId: e.target.value })}
                                    >
                                        <option value="">Tanlang...</option>
                                        {stockItems.map(item => (
                                            <option key={item.id} value={item.id}>
                                                {item.name} ({item.current} {item.unit})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label>Miqdor</Label>
                                    <Input
                                        type="number"
                                        value={newMovement.amount}
                                        onChange={(e) => setNewMovement({ ...newMovement, amount: e.target.value })}
                                    />
                                </div>
                                {movementType === 'in' && (
                                    <div>
                                        <Label>Narx (jami)</Label>
                                        <Input
                                            type="number"
                                            value={newMovement.price}
                                            onChange={(e) => setNewMovement({ ...newMovement, price: e.target.value })}
                                        />
                                    </div>
                                )}
                                <div>
                                    <Label>Izoh</Label>
                                    <Input
                                        value={newMovement.note}
                                        onChange={(e) => setNewMovement({ ...newMovement, note: e.target.value })}
                                    />
                                </div>
                                <Button onClick={handleAddMovement} className={`w-full ${movementType === 'in' ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-rose-500 hover:bg-rose-600'}`}>
                                    {movementType === 'in' ? 'Kirim qo&apos;shish' : 'Chiqim qo&apos;shish'}
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                <button
                    onClick={() => setIsAddMovementOpen(true)}
                    className="bg-card border border-border rounded-2xl p-4 md:p-5 text-left hover:border-blue-500/50 transition-colors group"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-blue-500 p-2.5 md:p-3 rounded-xl">
                            <Package className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                        </div>
                        <Edit2 className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-colors" />
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{totalStock} kg</div>
                    <div className="text-muted-foreground text-xs md:text-sm">Jami qurt qoldig&apos;i</div>
                </button>

                <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-emerald-500 p-2.5 md:p-3 rounded-xl">
                            <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                        </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{thisMonthIn} kg</div>
                    <div className="text-muted-foreground text-xs md:text-sm">Bu oy kirim</div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-amber-500 p-2.5 md:p-3 rounded-xl">
                            <TrendingDown className="h-4 w-4 md:h-5 md:w-5 text-foreground" />
                        </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{thisMonthOut} kg</div>
                    <div className="text-muted-foreground text-xs md:text-sm">Bu oy chiqim</div>
                </div>

                <div className="bg-card border border-border rounded-2xl p-4 md:p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="bg-rose-500 p-2.5 md:p-3 rounded-xl">
                            <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                    </div>
                    <div className="text-xl md:text-2xl font-bold text-foreground">{formatPrice(totalExpenses)}</div>
                    <div className="text-muted-foreground text-xs md:text-sm">Bu oy xarajat</div>
                </div>
            </div>

            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    <span className="text-amber-400">{lowStockItems.length} ta mahsulot kam qolgan! Yaqin orada olib kelish kerak.</span>
                </div>
            )}

            {/* Current Stock */}
            <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-xl font-bold text-foreground mb-4">Joriy qoldiq</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left text-muted-foreground font-medium px-4 py-3">Mahsulot</th>
                                <th className="text-left text-muted-foreground font-medium px-4 py-3">Qoldiq</th>
                                <th className="text-left text-muted-foreground font-medium px-4 py-3">Minimum</th>
                                <th className="text-left text-muted-foreground font-medium px-4 py-3">Narx</th>
                                <th className="text-left text-muted-foreground font-medium px-4 py-3">Yangilangan</th>
                                <th className="text-left text-muted-foreground font-medium px-4 py-3">Holat</th>
                                <th className="text-right text-muted-foreground font-medium px-4 py-3">Amallar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockItems.map((item) => (
                                <tr key={item.id} className="border-b border-border last:border-0">
                                    <td className="px-4 py-3">
                                        <span className="text-foreground font-medium">{item.name}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-foreground">{item.current} {item.unit}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-muted-foreground">{item.minRequired} {item.unit}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-foreground">{formatPrice(item.price)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-muted-foreground text-sm">{timeAgo(item.updatedAt)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-3 py-1 rounded-full text-xs ${item.current > item.minRequired
                                            ? "bg-emerald-500/20 text-emerald-400"
                                            : "bg-amber-500/20 text-amber-400"
                                            }`}>
                                            {item.current > item.minRequired ? "Yetarli" : "Kam qolgan"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button
                                                onClick={() => deleteStockItem(item.id)}
                                                className="p-2 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent Movements */}
            <div className="bg-card border border-border rounded-2xl p-5">
                <h2 className="text-xl font-bold text-foreground mb-4">So&apos;nggi kirim-chiqim</h2>
                {movements.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">Hali kirim-chiqim yo&apos;q</p>
                ) : (
                    <div className="space-y-3">
                        {movements.slice(0, 10).map((movement) => (
                            <div key={movement.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${movement.type === "IN" ? "bg-emerald-500/20" : "bg-rose-500/20"}`}>
                                        {movement.type === "IN" ? (
                                            <TrendingUp className="h-4 w-4 text-emerald-400" />
                                        ) : (
                                            <TrendingDown className="h-4 w-4 text-rose-400" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="text-foreground font-medium">
                                            {movement.type === "IN" ? "Kirim" : "Chiqim"}: {movement.stockItem?.name || "Noma'lum"}
                                        </div>
                                        <div className="text-muted-foreground text-sm">{timeAgo(movement.date)}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className={`font-medium ${movement.type === "IN" ? "text-emerald-400" : "text-rose-400"}`}>
                                        {movement.type === "IN" ? "+" : "-"}{movement.amount} {movement.stockItem?.unit || ""}
                                    </div>
                                    {movement.price && (
                                        <div className="text-muted-foreground text-sm">{formatPrice(movement.price)}</div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Edit Item Modal */}
            <Dialog open={isEditItemOpen} onOpenChange={setIsEditItemOpen}>
                <DialogContent className="max-w-[95vw] sm:max-w-md mx-auto">
                    <DialogHeader>
                        <DialogTitle>Mahsulotni tahrirlash</DialogTitle>
                    </DialogHeader>
                    {selectedItem && (
                        <div className="space-y-4">
                            <div>
                                <Label>Nomi</Label>
                                <Input
                                    value={selectedItem.name}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label>Miqdori</Label>
                                    <Input
                                        type="number"
                                        value={selectedItem.current}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, current: Number(e.target.value) })}
                                    />
                                </div>
                                <div>
                                    <Label>Minimum</Label>
                                    <Input
                                        type="number"
                                        value={selectedItem.minRequired}
                                        onChange={(e) => setSelectedItem({ ...selectedItem, minRequired: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                            <div>
                                <Label>Narx (1 birlik)</Label>
                                <Input
                                    type="number"
                                    value={selectedItem.price}
                                    onChange={(e) => setSelectedItem({ ...selectedItem, price: Number(e.target.value) })}
                                />
                            </div>
                            <Button onClick={handleEditItem} className="w-full bg-blue-500 hover:bg-blue-600">
                                Saqlash
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    )
}
