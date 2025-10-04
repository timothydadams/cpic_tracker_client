import { createSlice } from '@reduxjs/toolkit';
import { Buffer } from 'buffer';
import { jwtDecode } from 'jwt-decode';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    id: null,
    email: null,
    token: null,
    roles: [],
  },
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      const parsedToken = jwtDecode(accessToken);
      state.id = parsedToken.id;
      state.email = parsedToken.email;
      state.token = accessToken;
      state.roles = parsedToken.roles;
    },
    logout: (state) => {
      state.id = null;
      state.email = null;
      state.token = null;
      state.roles = [];
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectCurrentEmail = (state) => state.auth.email;
export const selectCurrentUserId = (state) => state.auth.id;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRoles = (state) => state.auth.roles;
