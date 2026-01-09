import { describe, it, expect, beforeEach } from 'vitest'

// Store ni test qilish uchun
// Note: Zustand persist localStorage kerak, test muhitida simulyatsiya qilamiz
describe('store', () => {
    beforeEach(async () => {
        // Store ni reset qilish har bir test oldidan
        const { useStore } = await import('../store')
        const store = useStore.getState()
        store.setTheme('dark')
        store.setLogoUrl('/logo.png')
    })

    describe('theme', () => {
        it("default theme mavjud", async () => {
            const { useStore } = await import('../store')
            const { theme } = useStore.getState()
            expect(['dark', 'light']).toContain(theme)
        })

        it("setTheme bilan theme o'zgaradi", async () => {
            const { useStore } = await import('../store')
            const { setTheme } = useStore.getState()
            setTheme('light')
            expect(useStore.getState().theme).toBe('light')
        })

        it("toggleTheme ishlaydi", async () => {
            const { useStore } = await import('../store')
            const { toggleTheme, setTheme } = useStore.getState()
            setTheme('dark')
            toggleTheme()
            expect(useStore.getState().theme).toBe('light')
        })

        it("toggleTheme teskari ishlaydi", async () => {
            const { useStore } = await import('../store')
            const { toggleTheme, setTheme } = useStore.getState()
            setTheme('light')
            toggleTheme()
            expect(useStore.getState().theme).toBe('dark')
        })
    })

    describe('logo', () => {
        it("default logoUrl mavjud", async () => {
            const { useStore } = await import('../store')
            const { logoUrl } = useStore.getState()
            expect(typeof logoUrl).toBe('string')
        })

        it("setLogoUrl ishlaydi", async () => {
            const { useStore } = await import('../store')
            const { setLogoUrl } = useStore.getState()
            setLogoUrl('/new-logo.png')
            expect(useStore.getState().logoUrl).toBe('/new-logo.png')
        })

        it("external URL bilan ham ishlaydi", async () => {
            const { useStore } = await import('../store')
            const { setLogoUrl } = useStore.getState()
            setLogoUrl('https://example.com/logo.png')
            expect(useStore.getState().logoUrl).toBe('https://example.com/logo.png')
        })
    })

    describe('store configuration', () => {
        it("useStore funksiya bo'lishi kerak", async () => {
            const { useStore } = await import('../store')
            expect(typeof useStore).toBe('function')
        })

        it("getState metodi mavjud", async () => {
            const { useStore } = await import('../store')
            expect(typeof useStore.getState).toBe('function')
        })
    })
})
