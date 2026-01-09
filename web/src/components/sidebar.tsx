"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import {
    LayoutDashboard,
    ClipboardList,
    Package,
    FolderOpen,
    Users,
    Settings,
    LogOut,
    Menu,
    ChevronRight,
    Sun,
    Moon,
    Warehouse,
    MapPin
} from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState, useEffect } from "react"
import { useStore } from "@/lib/store"
import { apiGet } from "@/lib/api-client"
import { NotificationDropdown } from "@/components/notification-dropdown"

const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/orders", label: "Buyurtmalar", icon: ClipboardList },
    { href: "/dashboard/warehouse", label: "Omborxona", icon: Warehouse },
    { href: "/dashboard/products", label: "Mahsulotlar", icon: Package },
    { href: "/dashboard/categories", label: "Kategoriyalar", icon: FolderOpen },
    { href: "/dashboard/regions", label: "Regionlar", icon: MapPin },
    { href: "/dashboard/customers", label: "Mijozlar", icon: Users },
    { href: "/dashboard/settings", label: "Sozlamalar", icon: Settings },
]

function NavContent({
    pathname,
    setOpen,
    handleLogout,
    logoUrl
}: {
    pathname: string;
    setOpen: (open: boolean) => void;
    handleLogout: () => void;
    logoUrl: string;
}) {
    return (
        <div className="flex flex-col h-full bg-sidebar">
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-sidebar-accent flex items-center justify-center">
                    <Image
                        src={logoUrl || '/logo.png'}
                        alt="Navqurt Logo"
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                        priority
                        unoptimized
                        onError={(e) => {
                            // Fallback to default logo if image fails to load
                            const target = e.target as HTMLImageElement
                            if (target.src !== '/logo.png') {
                                target.src = '/logo.png'
                            }
                        }}
                    />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-sidebar-foreground">NAVQURT</h1>
                    <p className="text-sm text-sidebar-foreground/70">Admin Panel</p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href ||
                        (item.href !== "/dashboard" && pathname.startsWith(item.href))
                    const isDashboard = item.href === "/dashboard" && pathname === "/dashboard"

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 rounded-xl transition-all",
                                isActive || isDashboard
                                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <Icon className="h-5 w-5" />
                                <span>{item.label}</span>
                            </div>
                            {isDashboard ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : null}
                        </Link>
                    )
                })}
            </nav>

            {/* Logout */}
            <div className="p-4 border-t border-sidebar-border">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-all"
                >
                    <LogOut className="h-5 w-5" />
                    <span>Chiqish</span>
                </button>
            </div>
        </div>
    )
}

export function Sidebar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)
    const { theme, toggleTheme, logoUrl, setLogoUrl } = useStore()

    // Load logo URL from API on mount
    useEffect(() => {
        const loadLogoUrl = async () => {
            try {
                const data = await apiGet<{ logoUrl?: string }>("/api/admin/settings")
                if (data.logoUrl) {
                    setLogoUrl(data.logoUrl)
                }
            } catch (error) {
                // Silently fail - use default logo from store
                // Default logo is already set in store, so no action needed
            }
        }
        loadLogoUrl()
    }, [setLogoUrl])

    const handleLogout = () => {
        signOut({ callbackUrl: "/login" })
    }

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-sidebar border-b border-sidebar-border px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Sheet open={open} onOpenChange={setOpen}>
                        <SheetTrigger asChild>
                            <button className="p-2 text-sidebar-foreground/70 hover:text-sidebar-foreground">
                                <Menu className="h-6 w-6" />
                            </button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-72 border-sidebar-border">
                            <NavContent pathname={pathname} setOpen={setOpen} handleLogout={handleLogout} logoUrl={logoUrl} />
                        </SheetContent>
                    </Sheet>
                    <span className="text-lg font-semibold text-sidebar-foreground">Dashboard</span>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={toggleTheme}
                        className="p-2 bg-sidebar-accent rounded-full text-sidebar-accent-foreground hover:bg-sidebar-accent/80 transition-colors"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <NotificationDropdown
                        buttonClassName="p-2 relative text-sidebar-foreground/70 cursor-pointer hover:text-sidebar-foreground transition-colors"
                        badgeClassName="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center pointer-events-none"
                    />
                </div>
            </div>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex lg:w-72 lg:flex-col lg:fixed lg:inset-y-0 border-r border-sidebar-border">
                <NavContent pathname={pathname} setOpen={setOpen} handleLogout={handleLogout} logoUrl={logoUrl} />
            </aside>
        </>
    )
}
