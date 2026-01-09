import { describe, it, expect, beforeEach } from 'vitest'
import { useStore } from '../store'

describe('useStore (Zustand)', () => {
    beforeEach(() => {
        // Store ni reset qilish
        const store = useStore.getState()
        store.setTheme('dark')
        store.setLogoUrl('/logo.png')
    })

    describe('theme', () => {
        it("default theme 'dark'", () => {
            const { theme } = useStore.getState()
            expect(theme).toBe('dark')
        })

        it("setTheme bilan theme o'zgaradi", () => {
            const { setTheme } = useStore.getState()
            setTheme('light')
            expect(useStore.getState().theme).toBe('light')
        })

        it("toggleTheme dark dan light ga o'zgartiradi", () => {
            const store = useStore.getState()
            store.setTheme('dark')
            store.toggleTheme()
            expect(useStore.getState().theme).toBe('light')
        })

        it("toggleTheme light dan dark ga o'zgartiradi", () => {
            const store = useStore.getState()
            store.setTheme('light')
            store.toggleTheme()
            expect(useStore.getState().theme).toBe('dark')
        })
    })

    describe('logo', () => {
        it("default logoUrl '/logo.png'", () => {
            const { logoUrl } = useStore.getState()
            expect(logoUrl).toBe('/logo.png')
        })

        it("setLogoUrl bilan logo o'zgaradi", () => {
            const { setLogoUrl } = useStore.getState()
            setLogoUrl('/new-logo.png')
            expect(useStore.getState().logoUrl).toBe('/new-logo.png')
        })

        it("custom URL bilan ishlaydi", () => {
            const { setLogoUrl } = useStore.getState()
            setLogoUrl('https://example.com/logo.png')
            expect(useStore.getState().logoUrl).toBe('https://example.com/logo.png')
        })
    })

    describe('persist', () => {
        it("store nomi to'g'ri", () => {
            // Store persist middleware bilan yaratilgan
            expect(useStore.persist).toBeDefined()
        })
    })
})
