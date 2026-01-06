import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types
export interface StockItem {
    id: string
    name: string
    current: number
    unit: string
    minRequired: number
    price: number
    updatedAt: Date
}

export interface StockMovement {
    id: string
    type: 'in' | 'out'
    itemId: string
    itemName: string
    amount: number
    unit: string
    price: number | null
    date: Date
    note?: string
}

export interface ScheduledDelivery {
    id: string
    itemName: string
    amount: number
    unit: string
    date: Date
    supplier: string
    estimatedCost: number
}

export interface Product {
    id: string
    name: string
    price: number
    stock: number
    sold: number
    categoryId: string
    status: 'active' | 'out'
    createdAt: Date
    updatedAt: Date
}

export interface Category {
    id: string
    name: string
    color: string
    createdAt: Date
}

export interface Order {
    id: string
    customerId: string
    customerName: string
    products: number
    status: 'new' | 'processing' | 'shipping' | 'delivered' | 'cancelled'
    amount: number
    createdAt: Date
    updatedAt: Date
}

export interface Customer {
    id: string
    name: string
    email: string
    phone?: string
    totalOrders: number
    totalSpent: number
    createdAt: Date
}

interface AppState {
    // Theme
    theme: 'dark' | 'light'
    setTheme: (theme: 'dark' | 'light') => void
    toggleTheme: () => void

    // Stock Items
    stockItems: StockItem[]
    addStockItem: (item: Omit<StockItem, 'id' | 'updatedAt'>) => void
    updateStockItem: (id: string, updates: Partial<StockItem>) => void
    deleteStockItem: (id: string) => void

    // Stock Movements
    movements: StockMovement[]
    addMovement: (movement: Omit<StockMovement, 'id' | 'date'>) => void
    deleteMovement: (id: string) => void

    // Scheduled Deliveries
    scheduledDeliveries: ScheduledDelivery[]
    addScheduledDelivery: (delivery: Omit<ScheduledDelivery, 'id'>) => void
    updateScheduledDelivery: (id: string, updates: Partial<ScheduledDelivery>) => void
    deleteScheduledDelivery: (id: string) => void

    // Products
    products: Product[]
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
    updateProduct: (id: string, updates: Partial<Product>) => void
    deleteProduct: (id: string) => void

    // Categories
    categories: Category[]
    addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void
    updateCategory: (id: string, updates: Partial<Category>) => void
    deleteCategory: (id: string) => void

    // Orders
    orders: Order[]
    updateOrderStatus: (id: string, status: Order['status']) => void

    // Customers
    customers: Customer[]
}

const generateId = () => Math.random().toString(36).substring(2, 9)

// Initial Data
const initialStockItems: StockItem[] = [
    { id: '1', name: 'Qurt (oq)', current: 45, unit: 'kg', minRequired: 20, price: 85000, updatedAt: new Date() },
    { id: '2', name: 'Qurt (sariq)', current: 28, unit: 'kg', minRequired: 25, price: 90000, updatedAt: new Date() },
    { id: '3', name: 'Qurt (aralash)', current: 12, unit: 'kg', minRequired: 30, price: 80000, updatedAt: new Date() },
    { id: '4', name: 'Qadoqlash qutilari (Maxi)', current: 150, unit: 'dona', minRequired: 100, price: 5000, updatedAt: new Date() },
    { id: '5', name: 'Qadoqlash qutilari (Midi)', current: 45, unit: 'dona', minRequired: 100, price: 3500, updatedAt: new Date() },
    { id: '6', name: 'Lenta va tasma', current: 8, unit: 'rulon', minRequired: 10, price: 25000, updatedAt: new Date() },
]

const initialMovements: StockMovement[] = [
    { id: '1', type: 'in', itemId: '1', itemName: 'Qurt (oq)', amount: 50, unit: 'kg', price: 4250000, date: new Date(Date.now() - 3600000) },
    { id: '2', type: 'out', itemId: '1', itemName: 'Qurt (oq)', amount: 5, unit: 'kg', price: null, date: new Date(Date.now() - 7200000) },
    { id: '3', type: 'in', itemId: '4', itemName: 'Qadoqlash qutilari (Maxi)', amount: 200, unit: 'dona', price: 1000000, date: new Date(Date.now() - 86400000) },
]

const initialProducts: Product[] = [
    { id: '1', name: 'Maxi box', price: 160000, stock: 45, sold: 45, categoryId: '1', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Premium box', price: 125000, stock: 38, sold: 38, categoryId: '1', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Midi box', price: 85000, stock: 32, sold: 32, categoryId: '1', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: '4', name: 'Mini box', price: 55000, stock: 27, sold: 27, categoryId: '1', status: 'active', createdAt: new Date(), updatedAt: new Date() },
    { id: '5', name: 'Mega box', price: 250000, stock: 0, sold: 15, categoryId: '1', status: 'out', createdAt: new Date(), updatedAt: new Date() },
]

const initialCategories: Category[] = [
    { id: '1', name: 'Boxlar', color: 'bg-blue-500', createdAt: new Date() },
    { id: '2', name: "Sovg'alar", color: 'bg-purple-500', createdAt: new Date() },
    { id: '3', name: 'Aksiyalar', color: 'bg-orange-500', createdAt: new Date() },
]

const initialOrders: Order[] = [
    { id: '10024', customerId: '1', customerName: 'Ali Valiyev', products: 3, status: 'new', amount: 245000, createdAt: new Date(Date.now() - 300000), updatedAt: new Date() },
    { id: '10023', customerId: '2', customerName: 'Malika Karimova', products: 2, status: 'processing', amount: 170000, createdAt: new Date(Date.now() - 900000), updatedAt: new Date() },
    { id: '10022', customerId: '3', customerName: 'Jasur Toshmatov', products: 5, status: 'shipping', amount: 420000, createdAt: new Date(Date.now() - 3600000), updatedAt: new Date() },
]

const initialCustomers: Customer[] = [
    { id: '1', name: 'Ali Valiyev', email: 'ali@mail.uz', totalOrders: 12, totalSpent: 1800000, createdAt: new Date() },
    { id: '2', name: 'Malika Karimova', email: 'malika@mail.uz', totalOrders: 8, totalSpent: 1200000, createdAt: new Date() },
    { id: '3', name: 'Jasur Toshmatov', email: 'jasur@mail.uz', totalOrders: 15, totalSpent: 2500000, createdAt: new Date() },
]

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            // Theme
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

            // Stock Items
            stockItems: initialStockItems,
            addStockItem: (item) => set((state) => ({
                stockItems: [...state.stockItems, { ...item, id: generateId(), updatedAt: new Date() }]
            })),
            updateStockItem: (id, updates) => set((state) => ({
                stockItems: state.stockItems.map(item =>
                    item.id === id ? { ...item, ...updates, updatedAt: new Date() } : item
                )
            })),
            deleteStockItem: (id) => set((state) => ({
                stockItems: state.stockItems.filter(item => item.id !== id)
            })),

            // Stock Movements
            movements: initialMovements,
            addMovement: (movement) => {
                const state = get()
                const newMovement = { ...movement, id: generateId(), date: new Date() }

                // Update stock item quantity
                const stockItem = state.stockItems.find(item => item.id === movement.itemId)
                if (stockItem) {
                    const newAmount = movement.type === 'in'
                        ? stockItem.current + movement.amount
                        : stockItem.current - movement.amount
                    state.updateStockItem(movement.itemId, { current: Math.max(0, newAmount) })
                }

                set((state) => ({ movements: [newMovement, ...state.movements] }))
            },
            deleteMovement: (id) => set((state) => ({
                movements: state.movements.filter(m => m.id !== id)
            })),

            // Scheduled Deliveries
            scheduledDeliveries: [],
            addScheduledDelivery: (delivery) => set((state) => ({
                scheduledDeliveries: [...state.scheduledDeliveries, { ...delivery, id: generateId() }]
            })),
            updateScheduledDelivery: (id, updates) => set((state) => ({
                scheduledDeliveries: state.scheduledDeliveries.map(d =>
                    d.id === id ? { ...d, ...updates } : d
                )
            })),
            deleteScheduledDelivery: (id) => set((state) => ({
                scheduledDeliveries: state.scheduledDeliveries.filter(d => d.id !== id)
            })),

            // Products
            products: initialProducts,
            addProduct: (product) => set((state) => ({
                products: [...state.products, { ...product, id: generateId(), createdAt: new Date(), updatedAt: new Date() }]
            })),
            updateProduct: (id, updates) => set((state) => ({
                products: state.products.map(p =>
                    p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
                )
            })),
            deleteProduct: (id) => set((state) => ({
                products: state.products.filter(p => p.id !== id)
            })),

            // Categories
            categories: initialCategories,
            addCategory: (category) => set((state) => ({
                categories: [...state.categories, { ...category, id: generateId(), createdAt: new Date() }]
            })),
            updateCategory: (id, updates) => set((state) => ({
                categories: state.categories.map(c =>
                    c.id === id ? { ...c, ...updates } : c
                )
            })),
            deleteCategory: (id) => set((state) => ({
                categories: state.categories.filter(c => c.id !== id)
            })),

            // Orders
            orders: initialOrders,
            updateOrderStatus: (id, status) => set((state) => ({
                orders: state.orders.map(o =>
                    o.id === id ? { ...o, status, updatedAt: new Date() } : o
                )
            })),

            // Customers
            customers: initialCustomers,
        }),
        {
            name: 'navqurt-admin-store',
        }
    )
)
