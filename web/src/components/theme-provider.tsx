"use client"

import { useEffect } from "react"
import { useStore } from "@/lib/store"

/**
 * Theme Provider Component
 * Applies theme class to HTML element based on store state
 * Handles SSR hydration properly
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme } = useStore()

    useEffect(() => {
        const root = document.documentElement
        
        // Remove both theme classes first
        root.classList.remove('light', 'dark')
        
        // Add 'dark' class only if theme is dark, otherwise use :root (light mode)
        if (theme === 'dark') {
            root.classList.add('dark')
        }
    }, [theme])

    return <>{children}</>
}
