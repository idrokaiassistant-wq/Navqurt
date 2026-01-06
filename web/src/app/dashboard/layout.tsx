"use client"

import { Sidebar } from "@/components/sidebar"
import { Sun, Moon, Bell } from "lucide-react"
import { useStore } from "@/lib/store"
import { useEffect } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const { theme, toggleTheme } = useStore()

    // Apply theme to document
    useEffect(() => {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
    }, [theme])

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-slate-950' : 'bg-gray-100'}`}>
            <Sidebar />
            <main className="lg:pl-72 pt-16 lg:pt-0">
                {/* Desktop Header */}
                <div className={`hidden lg:flex items-center justify-end gap-3 p-4 border-b ${theme === 'dark' ? 'border-slate-800' : 'border-gray-200'}`}>
                    <button
                        onClick={toggleTheme}
                        className={`p-2.5 rounded-full transition-colors ${theme === 'dark'
                                ? 'bg-slate-800 text-amber-400 hover:bg-slate-700'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    <button className={`p-2.5 relative transition-colors ${theme === 'dark' ? 'text-slate-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}>
                        <Bell className="h-5 w-5" />
                        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                            3
                        </span>
                    </button>
                </div>
                <div className="p-4 lg:p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
