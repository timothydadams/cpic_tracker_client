import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/apiSlice';
import authReducer from '../features/auth/authSlice';
import strategyReducer from '../features/strategies/strategiesSlice';
import implementerReducer from '../features/implementers/implementersSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    strategy: strategyReducer,
    implementers: implementerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([api.middleware]),
  devTools: process.env.NODE_ENV !== 'production' && {
    maxAge: 25,
    autoPause: true,
    stateSanitizer: (state) => ({
      ...state,
      [api.reducerPath]: '<<RTK_QUERY_CACHE>>',
    }),
  },
});

setupListeners(store.dispatch);
