import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../redux/rootReducer';
import {
  reset as resetChat,
  setTypingIndicator,
  updateUserOnlineStatus,
} from '../../redux/slices/chat';

const createStore = (preloaded = {}) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloaded,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe('Chat Slice', () => {
  it('should start with initial state', () => {
    const store = createStore();
    const { chat } = store.getState();
    expect(chat.userList).toEqual([]);
    expect(chat.typingIndicators).toEqual({});
    expect(chat.isLoading).toBe(false);
  });

  it('should set typing indicator', () => {
    const store = createStore();
    store.dispatch(setTypingIndicator({ conversationId: 'conv1', typing: true }));
    expect(store.getState().chat.typingIndicators.conv1).toBe(true);
  });

  it('should clear typing indicator', () => {
    const store = createStore({
      chat: {
        userList: [],
        isLoading: false,
        error: null,
        typingIndicators: { conv1: true },
      },
    });
    store.dispatch(setTypingIndicator({ conversationId: 'conv1', typing: false }));
    expect(store.getState().chat.typingIndicators.conv1).toBeUndefined();
  });

  it('should update user online status', () => {
    const store = createStore({
      chat: {
        userList: [
          { _id: 'u1', name: 'Alice', status: 'Offline' },
          { _id: 'u2', name: 'Bob', status: 'Offline' },
        ],
        isLoading: false,
        error: null,
        typingIndicators: {},
      },
    });

    store.dispatch(updateUserOnlineStatus({ userId: 'u1', status: 'Online' }));
    const alice = store.getState().chat.userList.find((u) => u._id === 'u1');
    expect(alice.status).toBe('Online');
  });

  it('should reset chat state', () => {
    const store = createStore({
      chat: {
        userList: [{ _id: 'u1' }],
        isLoading: true,
        error: 'some error',
        typingIndicators: { conv1: true },
      },
    });

    store.dispatch(resetChat());
    const { chat } = store.getState();
    expect(chat.userList).toEqual([]);
    expect(chat.isLoading).toBe(false);
    expect(chat.typingIndicators).toEqual({});
  });
});
