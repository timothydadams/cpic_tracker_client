import React from 'react';
import { renderHook } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useTokenRefreshTimer from '../useTokenRefreshTimer';
import { createTestStore } from '../../test/test-utils';

// Build a minimal JWT with a given exp (seconds since epoch).
// Format: base64url(header).base64url(payload).signature
function makeToken(exp, claims = {}) {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = btoa(
    JSON.stringify({
      id: 'test-user',
      email: 'test@test.com',
      roles: ['Admin'],
      given_name: 'Test',
      family_name: 'User',
      display_name: 'Test User',
      exp,
      ...claims,
    })
  );
  return `${header}.${payload}.fakesig`;
}

// Mock the refresh mutation so we can track when it's called
const mockRefreshTrigger = vi.fn(() => ({ unwrap: () => Promise.resolve() }));
vi.mock('../../features/auth/authApiSlice', () => ({
  useRefreshMutation: () => [mockRefreshTrigger, { isUninitialized: true }],
}));

function createWrapper(store) {
  return function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <MemoryRouter>{children}</MemoryRouter>
      </Provider>
    );
  };
}

describe('useTokenRefreshTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: false });
    mockRefreshTrigger.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not schedule refresh when there is no token', () => {
    const store = createTestStore({
      auth: { token: null, user: null },
    });

    renderHook(() => useTokenRefreshTimer('SHORT'), {
      wrapper: createWrapper(store),
    });

    // Advance time well past any reasonable buffer
    vi.advanceTimersByTime(120_000);
    expect(mockRefreshTrigger).not.toHaveBeenCalled();
  });

  it('refreshes immediately when token is already expired', () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 60; // expired 60s ago
    const token = makeToken(expiredExp);
    const store = createTestStore({
      auth: {
        token,
        user: { id: 'test-user', roles: ['Admin'] },
      },
    });

    renderHook(() => useTokenRefreshTimer('SHORT'), {
      wrapper: createWrapper(store),
    });

    expect(mockRefreshTrigger).toHaveBeenCalledWith('SHORT');
  });

  it('refreshes immediately when token expires within the 60s buffer', () => {
    const soonExp = Math.floor(Date.now() / 1000) + 30; // expires in 30s
    const token = makeToken(soonExp);
    const store = createTestStore({
      auth: {
        token,
        user: { id: 'test-user', roles: ['Admin'] },
      },
    });

    renderHook(() => useTokenRefreshTimer('LONG'), {
      wrapper: createWrapper(store),
    });

    expect(mockRefreshTrigger).toHaveBeenCalledWith('LONG');
  });

  it('schedules refresh 60s before token expiry', () => {
    // Token expires in 5 minutes (300s)
    const futureExp = Math.floor(Date.now() / 1000) + 300;
    const token = makeToken(futureExp);
    const store = createTestStore({
      auth: {
        token,
        user: { id: 'test-user', roles: ['Admin'] },
      },
    });

    renderHook(() => useTokenRefreshTimer('SHORT'), {
      wrapper: createWrapper(store),
    });

    // Should not have refreshed yet
    expect(mockRefreshTrigger).not.toHaveBeenCalled();

    // Advance to just before the scheduled time (300s - 60s buffer = 240s)
    vi.advanceTimersByTime(239_000);
    expect(mockRefreshTrigger).not.toHaveBeenCalled();

    // Advance past the scheduled time
    vi.advanceTimersByTime(2_000);
    expect(mockRefreshTrigger).toHaveBeenCalledWith('SHORT');
    expect(mockRefreshTrigger).toHaveBeenCalledTimes(1);
  });

  it('clears timer on unmount', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 300;
    const token = makeToken(futureExp);
    const store = createTestStore({
      auth: {
        token,
        user: { id: 'test-user', roles: ['Admin'] },
      },
    });

    const { unmount } = renderHook(() => useTokenRefreshTimer('SHORT'), {
      wrapper: createWrapper(store),
    });

    unmount();

    // Advance past when refresh would have fired
    vi.advanceTimersByTime(300_000);
    expect(mockRefreshTrigger).not.toHaveBeenCalled();
  });

  it('passes persist duration to refresh call', () => {
    const expiredExp = Math.floor(Date.now() / 1000) - 10;
    const token = makeToken(expiredExp);
    const store = createTestStore({
      auth: {
        token,
        user: { id: 'test-user', roles: ['Admin'] },
      },
    });

    renderHook(() => useTokenRefreshTimer('LONG'), {
      wrapper: createWrapper(store),
    });

    expect(mockRefreshTrigger).toHaveBeenCalledWith('LONG');
  });

  it('does not refresh when token has no valid exp claim', () => {
    // Malformed token that won't decode properly
    const store = createTestStore({
      auth: {
        token: 'not-a-valid-jwt',
        user: { id: 'test-user', roles: ['Admin'] },
      },
    });

    renderHook(() => useTokenRefreshTimer('SHORT'), {
      wrapper: createWrapper(store),
    });

    vi.advanceTimersByTime(120_000);
    expect(mockRefreshTrigger).not.toHaveBeenCalled();
  });
});
