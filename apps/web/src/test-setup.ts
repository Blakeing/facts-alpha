/**
 * test-setup.ts
 *
 * Global test setup file for Vitest
 * Mocks and configurations for test environment
 */

import { vi } from 'vitest'

// Mock window.matchMedia (needed for Vuetify)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver (needed for Vuetify)
globalThis.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return []
  }
  unobserve() {}
} as any

// Mock ResizeObserver (needed for Vuetify)
globalThis.ResizeObserver = class ResizeObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
} as any

// Mock apiUrls before any modules import it
// This must be defined before location API imports
vi.mock('@/shared/api/urls', () => ({
  apiUrls: {
    locations: {
      listing: '/api/locations',
      detail: '/api/locations/:id',
    },
    contracts: {
      listing: '/api/contracts',
      detail: '/api/contracts/:id',
    },
  },
}))

// Mock location API to prevent transitive import issues
vi.mock('@/entities/location/api', () => ({
  LocationApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))

// Mock location index to prevent transitive imports
vi.mock('@/entities/location', () => ({
  LocationApi: {
    list: vi.fn(),
    get: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}))
