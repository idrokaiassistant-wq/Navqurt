"use client"

import { Sidebar } from "@/components/sidebar"
import { Sun, Moon } from "lucide-react"
import { useStore } from "@/lib/store"
import { NotificationDropdown } from "@/components/notification-dropdown"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, toggleTheme } = useStore()

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-background">
            <Sidebar />
            <main className="lg:pl-72 pt-16 lg:pt-0 w-full max-w-full overflow-x-hidden">
                {/* Desktop Header */}
                <div className="hidden lg:flex items-center justify-end gap-3 p-4 border-b border-border">
                    <button
                        onClick={toggleTheme}
                        className="p-2.5 rounded-full transition-colors bg-secondary text-foreground hover:bg-accent"
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <NotificationDropdown
                        buttonClassName="p-2.5 relative transition-colors text-muted-foreground hover:text-foreground cursor-pointer"
                        badgeClassName="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium"
                    />
                </div>
                <div className="p-4 lg:p-6 w-full max-w-full overflow-x-hidden">
                    {children}
                </div>
            </main>
        </div>
    )
}
