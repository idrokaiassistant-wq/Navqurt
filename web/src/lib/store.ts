import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
    // Theme
    theme: 'dark' | 'light'
    setTheme: (theme: 'dark' | 'light') => void
    toggleTheme: () => void

    // Logo
    logoUrl: string
    setLogoUrl: (url: string) => void

    // Notifications
    readNotificationIds: string[]
    markNotificationAsRead: (id: string) => void
    markAllNotificationsAsRead: () => void
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Theme - default to 'light' mode
            theme: 'light',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

            // Logo
            logoUrl: '/logo.png',
            setLogoUrl: (logoUrl) => set({ logoUrl }),

            // Notifications
            readNotificationIds: [],
            markNotificationAsRead: (id) => set((state) => {
                if (state.readNotificationIds.includes(id)) {
                    return state
                }
                return {
                    readNotificationIds: [...state.readNotificationIds, id]
                }
            }),
            markAllNotificationsAsRead: () => set(() => ({
                readNotificationIds: []
            })),
        }),
        {
            name: 'navqurt-admin-store',
        }
    )
)

