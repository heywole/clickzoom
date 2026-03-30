import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import tutorialReducer from './tutorialSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tutorials: tutorialReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export default store;
