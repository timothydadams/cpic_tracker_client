import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './api/apiSlice';
//import { wxSlice } from "./api/wxService";
import authReducer from '../features/auth/authSlice';
import wxReducer from '../features/weather/wxSlice';

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
    wx: wxReducer,
    //[wxSlice.reducerPath]: wxSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat([
      apiSlice.middleware,
      // wxSlice.middleware,
    ]),
  devTools: true,
});
