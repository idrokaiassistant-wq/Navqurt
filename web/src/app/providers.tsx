"use client"

import { SessionProvider } from "next-auth/react"
import { TelegramProvider } from "@/components/telegram-provider"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TelegramProvider>
        {children}
      </TelegramProvider>
    </SessionProvider>
  )
}





