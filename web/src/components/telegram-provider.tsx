"use client"

import { useEffect } from "react"
import { initTelegramWebApp } from "@/lib/telegram-webapp"

/**
 * Telegram WebApp Provider
 * Initializes Telegram WebApp API when component mounts
 * Should be used in the root layout or app component
 */
export function TelegramProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Initialize Telegram WebApp when component mounts
        const tg = initTelegramWebApp()
        
        if (tg) {
            console.log('Telegram WebApp initialized', {
                platform: tg.platform,
                version: tg.version,
                viewportHeight: tg.viewportHeight,
                colorScheme: tg.colorScheme,
            })
        }
    }, [])

    return <>{children}</>
}
