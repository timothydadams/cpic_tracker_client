import { createSlice, createSelector } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const initialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken } = action.payload;
      const parsedToken = jwtDecode(accessToken);
      state.token = accessToken;
      state.user = parsedToken;
    },
    setUserProfile: (state, action) => {
      if (state.user) {
        Object.assign(state.user, action.payload);
      }
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
    },
  },
});

export const { setCredentials, setUserProfile, logout } = authSlice.actions;

export default authSlice.reducer;

const selectUser = (state) => state.auth.user;

export const selectMemoizedUser = createSelector([selectUser], (user) => {
  const data = user ? { ...user } : {};

  if (!data?.roles) {
    data.roles = ['Guest'];
    data.status = 'Guest';
  }

  if (!data?.id) {
    data.id = null;
  }

  const appRoles = ['Implementer', 'CPIC Member', 'CPIC Admin', 'Admin'];

  for (const role of appRoles) {
    const key = `is${role.replace(' ', '')}`;
    data[key] = data?.roles.includes(role) ? true : false;
    if (data[key] == true) {
      data.status = role;
    }
  }

  return data;
});

export const selectCurrentEmail = (state) => state.auth.user?.email;
export const selectCurrentUserId = (state) => state.auth.user?.id;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRoles = (state) => state.auth.user?.roles;
