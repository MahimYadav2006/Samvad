import React from 'react';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import { rootReducer } from '../../redux/rootReducer';

/**
 * Create a test store with optional preloaded state
 */
export function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
  });
}

/**
 * Render component with Redux Provider and Router
 */
export function renderWithProviders(
  ui,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <Provider store={store}>
        <BrowserRouter>{children}</BrowserRouter>
      </Provider>
    );
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}

/**
 * Default authenticated state
 */
export const authenticatedState = {
  auth: {
    isLoading: false,
    error: null,
    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWY5ZTNhMTIzNDU2Nzg5MGFiY2RlZjAiLCJpYXQiOjE3MjAwMDAwMDB9.test-sig',
    user: { _id: '65f9e3a1234567890abcdef0' },
    isLoggedIn: true,
  },
  user: {
    isLoading: false,
    error: null,
    user: {
      _id: '65f9e3a1234567890abcdef0',
      name: 'Test User',
      email: 'test@test.com',
      status: 'Online',
    },
    currConversation: null,
    currMessages: [],
    oppositeUser: {},
    socket: null,
  },
  chat: {
    userList: [],
    isLoading: false,
    error: null,
    typingIndicators: {},
  },
  app: {
    modals: { gif: false, voice: false, media: false, document: false },
    selectedGifUrl: '',
  },
};
