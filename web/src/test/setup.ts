import '@testing-library/jest-dom/vitest'

// LocalStorage mock - Zustand persist uchun kerak
const localStorageMock = {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    length: 0,
    key: () => null,
}
global.localStorage = localStorageMock as Storage

// Global test setup
beforeAll(() => {
    // Any global setup before all tests
})

afterAll(() => {
    // Any global cleanup after all tests
})
