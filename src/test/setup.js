// Mock apiSlice to break circular dependency:
// apiSlice → authSlice → authApiSlice → usersApiSlice → apiSlice
// The mock creates a real createApi instance without the auth imports.
// This must be before other imports since vi.mock is hoisted.
vi.mock('../app/api/apiSlice', async () => {
  const { createApi, fetchBaseQuery } = await vi.importActual(
    '@reduxjs/toolkit/query/react'
  );
  const api = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
      baseUrl: 'http://localhost:3500/api',
      credentials: 'include',
    }),
    tagTypes: [
      'FocusArea',
      'Policy',
      'Implementer',
      'Strategy',
      'Comment',
      'Invite',
      'FeatureFlag',
      'ScorecardConfig',
    ],
    endpoints: () => ({}),
  });
  return { api };
});

import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, afterAll } from 'vitest';
import { server } from './mocks/server';

// Automatically unmount components after each test
afterEach(() => {
  cleanup();
});

// MSW server lifecycle
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Mock window.matchMedia (required by @uidotdev/usehooks useMediaQuery
// and Radix UI components)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver (required by Radix UI / @floating-ui overlay components)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {
    this.root = null;
    this.thresholds = [0];
  }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
};

// Stub process.env for test environment
process.env.NODE_ENV = 'test';
process.env.GOOGLE_CLIENT_ID = 'test-google-client-id';
process.env.API_URL = 'http://localhost:3500';
