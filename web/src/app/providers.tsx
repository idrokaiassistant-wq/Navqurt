"use client"

import { SessionProvider } from "next-auth/react"
import { TelegramProvider } from "@/components/telegram-provider"
import { ThemeProvider } from "@/components/theme-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TelegramProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </TelegramProvider>
    </SessionProvider>
  )
}





