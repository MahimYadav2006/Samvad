import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { rootReducer } from '../../redux/rootReducer';
import {
  toggleGifModal,
  toggleAudioModal,
  toggleMediaModal,
  toggleDocumentModal,
  reset,
} from '../../redux/slices/app';

const createStore = () =>
  configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });

describe('App Slice', () => {
  it('should toggle gif modal', () => {
    const store = createStore();
    store.dispatch(toggleGifModal({ value: true, url: 'https://g.com/test.gif' }));
    expect(store.getState().app.modals.gif).toBe(true);
    expect(store.getState().app.selectedGifUrl).toBe('https://g.com/test.gif');
  });

  it('should toggle audio modal', () => {
    const store = createStore();
    store.dispatch(toggleAudioModal(true));
    expect(store.getState().app.modals.audio).toBe(true);
  });

  it('should toggle media modal', () => {
    const store = createStore();
    store.dispatch(toggleMediaModal(true));
    expect(store.getState().app.modals.media).toBe(true);
  });

  it('should toggle document modal', () => {
    const store = createStore();
    store.dispatch(toggleDocumentModal(true));
    expect(store.getState().app.modals.document).toBe(true);
  });

  it('should reset to initial state', () => {
    const store = createStore();
    store.dispatch(toggleGifModal({ value: true, url: 'test' }));
    store.dispatch(reset());
    const { app } = store.getState();
    expect(app.modals.gif).toBe(false);
    expect(app.selectedGifUrl).toBe('');
  });
});
