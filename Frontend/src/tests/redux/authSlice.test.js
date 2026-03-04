import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../redux/rootReducer';
import { reset as resetAuth } from '../../redux/slices/auth';

const createStore = (preloaded = {}) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloaded,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe('Auth Slice', () => {
  it('should start with initial state', () => {
    const store = createStore();
    const { auth } = store.getState();
    expect(auth.isLoading).toBe(false);
    expect(auth.token).toBeNull();
    expect(auth.isLoggedIn).toBe(false);
    expect(auth.error).toBeNull();
  });

  it('should reset auth state', () => {
    const store = createStore({
      auth: {
        isLoading: false,
        error: null,
        token: 'abc.def.ghi',
        user: { _id: '123' },
        isLoggedIn: true,
      },
    });

    store.dispatch(resetAuth());
    const { auth } = store.getState();
    expect(auth.token).toBeNull();
    expect(auth.isLoggedIn).toBe(false);
  });
});
