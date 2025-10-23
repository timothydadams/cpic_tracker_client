import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { api } from './api/apiSlice';
import authReducer from '../features/auth/authSlice';
import strategyReducer from '../features/strategies/strategiesSlice';
import userReducer from '../features/users/usersSlice';
import implementerReducer from '../features/implementers/implementersSlice';

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: authReducer,
    strategy: strategyReducer,
    user: userReducer,
    implementers: implementerReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([api.middleware]),
  devTools: true,
});

setupListeners(store.dispatch);
