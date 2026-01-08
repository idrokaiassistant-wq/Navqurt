import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
    // Theme
    theme: 'dark' | 'light'
    setTheme: (theme: 'dark' | 'light') => void
    toggleTheme: () => void
}

export const useStore = create<AppState>()(
    persist(
        (set) => ({
            // Theme
            theme: 'dark',
            setTheme: (theme) => set({ theme }),
            toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
        }),
        {
            name: 'navqurt-admin-store',
        }
    )
)
