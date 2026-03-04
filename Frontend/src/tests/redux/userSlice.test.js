import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../redux/rootReducer';
import {
  reset as resetUser,
  addCurrMessage,
  updateOppositeUserStatus,
} from '../../redux/slices/user';

const createStore = (preloaded = {}) =>
  configureStore({
    reducer: rootReducer,
    preloadedState: preloaded,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe('User Slice', () => {
  it('should start with initial state', () => {
    const store = createStore();
    const { user } = store.getState();
    expect(user.isLoading).toBe(false);
    expect(user.currConversation).toBeNull();
    expect(user.currMessages).toEqual([]);
    expect(user.socket).toBeNull();
  });

  it('should add a message to currMessages', () => {
    const store = createStore();
    store.dispatch(addCurrMessage({ _id: 'msg1', content: 'Hello' }));
    expect(store.getState().user.currMessages).toHaveLength(1);
    expect(store.getState().user.currMessages[0].content).toBe('Hello');
  });

  it('should add multiple messages', () => {
    const store = createStore();
    store.dispatch(addCurrMessage({ _id: 'msg1', content: 'One' }));
    store.dispatch(addCurrMessage({ _id: 'msg2', content: 'Two' }));
    expect(store.getState().user.currMessages).toHaveLength(2);
  });

  it('should update opposite user status', () => {
    const store = createStore({
      user: {
        isLoading: false,
        error: null,
        user: {},
        currConversation: null,
        currMessages: [],
        oppositeUser: { _id: 'opp1', name: 'Opponent', status: 'Offline' },
        socket: null,
      },
    });

    store.dispatch(updateOppositeUserStatus({ userId: 'opp1', status: 'Online' }));
    expect(store.getState().user.oppositeUser.status).toBe('Online');
  });

  it('should not update opposite user status if userId does not match', () => {
    const store = createStore({
      user: {
        isLoading: false,
        error: null,
        user: {},
        currConversation: null,
        currMessages: [],
        oppositeUser: { _id: 'opp1', name: 'Opponent', status: 'Offline' },
        socket: null,
      },
    });

    store.dispatch(updateOppositeUserStatus({ userId: 'opp2', status: 'Online' }));
    expect(store.getState().user.oppositeUser.status).toBe('Offline');
  });

  it('should reset user state', () => {
    const store = createStore({
      user: {
        isLoading: true,
        error: 'err',
        user: { name: 'Test' },
        currConversation: 'conv1',
        currMessages: [{ _id: 'm1' }],
        oppositeUser: { _id: 'o1' },
        socket: {},
      },
    });

    store.dispatch(resetUser());
    const { user } = store.getState();
    expect(user.currConversation).toBeNull();
    expect(user.currMessages).toEqual([]);
    expect(user.socket).toBeNull();
  });
});
