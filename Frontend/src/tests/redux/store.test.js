import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../redux/rootReducer';

describe('Redux Store & Root Reducer', () => {
  it('should create store with all slices', () => {
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    const state = store.getState();
    expect(state).toHaveProperty('app');
    expect(state).toHaveProperty('auth');
    expect(state).toHaveProperty('user');
    expect(state).toHaveProperty('chat');
  });

  it('should have correct initial app state', () => {
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    const { app } = store.getState();
    expect(app.modals.gif).toBe(false);
    expect(app.modals.voice).toBe(false);
    expect(app.modals.media).toBe(false);
    expect(app.modals.document).toBe(false);
    expect(app.selectedGifUrl).toBe('');
  });

  it('should have correct initial auth state', () => {
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    const { auth } = store.getState();
    expect(auth.isLoading).toBe(false);
    expect(auth.token).toBeNull();
    expect(auth.isLoggedIn).toBe(false);
  });

  it('should have correct initial user state', () => {
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    const { user } = store.getState();
    expect(user.isLoading).toBe(false);
    expect(user.currConversation).toBeNull();
    expect(user.currMessages).toEqual([]);
  });

  it('should have correct initial chat state', () => {
    const store = configureStore({
      reducer: rootReducer,
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }),
    });

    const { chat } = store.getState();
    expect(chat.userList).toEqual([]);
    expect(chat.typingIndicators).toEqual({});
  });
});
