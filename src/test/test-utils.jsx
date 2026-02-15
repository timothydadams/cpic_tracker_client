import React from 'react';
import { render } from '@testing-library/react';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import { api } from '../app/api/apiSlice';
import authReducer from '../features/auth/authSlice';
import strategyReducer from '../features/strategies/strategiesSlice';
import implementerReducer from '../features/implementers/implementersSlice';

/**
 * Creates a fresh Redux store for testing.
 * Mirrors the production store in src/app/store.js.
 */
export function createTestStore(preloadedState = {}) {
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      auth: authReducer,
      strategy: strategyReducer,
      implementers: implementerReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(api.middleware),
    preloadedState,
  });
  setupListeners(store.dispatch);
  return store;
}

/**
 * Helper to build an auth state object with defaults.
 */
export function createAuthState(overrides = {}) {
  const defaults = {
    token: 'fake-jwt-token',
    user: {
      id: 'test-user-id',
      email: 'admin@test.com',
      roles: ['Admin'],
      given_name: 'Test',
      family_name: 'Admin',
      display_name: 'Test Admin',
      username: 'testadmin',
      profile_pic: null,
    },
  };

  return {
    ...defaults,
    ...overrides,
    user:
      overrides.user === null ? null : { ...defaults.user, ...overrides.user },
  };
}

/**
 * Preset auth states for common role scenarios.
 * Role names match authSlice.js selectMemoizedUser.
 */
export const AUTH_STATES = {
  admin: createAuthState(),
  cpicAdmin: createAuthState({
    user: {
      id: 'cpic-admin-id',
      email: 'cpicadmin@test.com',
      roles: ['CPIC Admin'],
      given_name: 'CPIC',
      family_name: 'Admin',
      display_name: 'CPIC Admin',
      username: 'cpicadmin',
    },
  }),
  cpicMember: createAuthState({
    user: {
      id: 'cpic-member-id',
      email: 'member@test.com',
      roles: ['CPIC Member'],
      given_name: 'CPIC',
      family_name: 'Member',
      display_name: 'CPIC Member',
      username: 'cpicmember',
    },
  }),
  implementer: createAuthState({
    user: {
      id: 'implementer-id',
      email: 'impl@test.com',
      roles: ['Implementer'],
      given_name: 'Test',
      family_name: 'Implementer',
      display_name: 'Test Implementer',
      username: 'testimpl',
    },
  }),
  viewer: createAuthState({
    user: {
      id: 'viewer-id',
      email: 'viewer@test.com',
      roles: ['Viewer'],
      given_name: 'Test',
      family_name: 'Viewer',
      display_name: 'Test Viewer',
      username: 'testviewer',
    },
  }),
  guest: {
    token: null,
    user: null,
  },
};

/**
 * Custom render that wraps components in all required providers.
 * Use instead of @testing-library/react's render in all tests.
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    route = '/',
    routerEntries,
    ...renderOptions
  } = {}
) {
  const entries = routerEntries || [route];

  function Wrapper({ children }) {
    return (
      <SnackbarProvider
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        autoHideDuration={2500}
      >
        <Provider store={store}>
          <MemoryRouter initialEntries={entries}>{children}</MemoryRouter>
        </Provider>
      </SnackbarProvider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

// Re-export everything from RTL so tests import from one place
export * from '@testing-library/react';
// Override the default render with the wrapped version
export { renderWithProviders as render };
