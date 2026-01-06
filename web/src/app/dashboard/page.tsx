import { ClipboardList, TrendingUp, Users, Package, Clock } from "lucide-react"

const stats = [
    {
        value: "24",
        label: "Bugungi buyurtmalar",
        change: "+12%",
        positive: true,
        icon: ClipboardList,
        iconBg: "bg-blue-500",
    },
    {
        value: "2.4M",
        label: "Jami savdo (bugun)",
        change: "+8%",
        positive: true,
        icon: TrendingUp,
        iconBg: "bg-emerald-500",
    },
    {
        value: "8",
        label: "Yangi mijozlar",
        change: "+23%",
        positive: true,
        icon: Users,
        iconBg: "bg-amber-500",
    },
    {
        value: "142",
        label: "Mahsulotlar",
        change: "-2",
        positive: false,
        icon: Package,
        iconBg: "bg-rose-500",
    },
]

const recentOrders = [
    {
        id: "#10024",
        name: "Ali Valiyev",
        products: 3,
        status: "Yangi",
        statusColor: "bg-emerald-500",
        time: "5 daqiqa oldin",
        amount: "245,000"
    },
    {
        id: "#10023",
        name: "Malika Karimova",
        products: 2,
        status: "Jarayonda",
        statusColor: "bg-blue-500",
        time: "15 daqiqa oldin",
        amount: "170,000"
    },
    {
        id: "#10022",
        name: "Jasur Toshmatov",
        products: 5,
        status: "Yo&apos;lda",
        statusColor: "bg-amber-500",
        time: "1 soat oldin",
        amount: "420,000"
    },
]

const topProducts = [
    { name: "Maxi box", sold: 45, revenue: "7.2M" },
    { name: "Premium box", sold: 38, revenue: "4.75M" },
    { name: "Midi box", sold: 32, revenue: "2.72M" },
]

const categories = [
    { name: "Boxlar", amount: "15.6M", percentage: 65, color: "bg-blue-500" },
    { name: "Sovg&apos;alar", amount: "6M", percentage: 25, color: "bg-purple-500" },
    { name: "Aksiyalar", amount: "2.4M", percentage: 10, color: "bg-orange-500" },
]

export default function DashboardPage() {
    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon
                    return (
                        <div
                            key={index}
                            className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className={`${stat.iconBg} p-3 rounded-xl`}>
                                    <Icon className="h-6 w-6 text-white" />
                                </div>
                                <span className={`text-sm font-medium flex items-center gap-1 ${stat.positive ? "text-emerald-400" : "text-rose-400"
                                    }`}>
                                    <span>{stat.positive ? "↑" : "↓"}</span>
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-3xl font-bold text-white mb-1">
                                {stat.value}
                            </div>
                            <div className="text-slate-400 text-sm">
                                {stat.label}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <div className="mb-4">
                    <h2 className="text-xl font-bold text-white">So&apos;ngi buyurtmalar</h2>
                    <p className="text-slate-400 text-sm">Bugungi faol buyurtmalar</p>
                </div>
                <div className="space-y-4">
                    {recentOrders.map((order, index) => (
                        <div key={index} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-white font-semibold">
                                    {order.name.charAt(0)}
                                </div>
                                <div>
                                    <div className="text-white font-medium">{order.name}</div>
                                    <div className="text-slate-400 text-sm">
                                        {order.id} • {order.products} ta mahsulot
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`${order.statusColor} text-white text-xs px-3 py-1 rounded-full`}>
                                    {order.status}
                                </span>
                            </div>
                        </div>
                    ))}
                    {recentOrders.map((order, index) => (
                        <div key={`time-${index}`} className="flex items-center justify-between text-sm -mt-2 pb-3 border-b border-slate-800 last:border-0">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock className="h-4 w-4" />
                                {order.time}
                            </div>
                            <div className="text-white font-semibold">{order.amount} so&apos;m</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Top Products */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold text-white mb-4">Top mahsulotlar</h2>
                <div className="space-y-4">
                    {topProducts.map((product, index) => (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <span className="text-lg">📦</span>
                                </div>
                                <div>
                                    <div className="text-white font-medium">{product.name}</div>
                                    <div className="text-slate-400 text-sm">{product.sold} ta sotildi</div>
                                </div>
                            </div>
                            <div className="text-white font-semibold">{product.revenue}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Category Stats */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
                <h2 className="text-xl font-bold text-white mb-4">Kategoriya bo&apos;yicha</h2>
                <div className="space-y-4">
                    {categories.map((cat, index) => (
                        <div key={index}>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-slate-300">{cat.name}</span>
                                <span className="text-white font-semibold">{cat.amount}</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2">
                                <div
                                    className={`${cat.color} h-2 rounded-full transition-all`}
                                    style={{ width: `${cat.percentage}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
