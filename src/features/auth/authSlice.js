import { createSlice, createSelector } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
//import { userLogin } from './authActions';
import { authApiSlice } from './authApiSlice';

const initialState = {
  isLoading: false,
  user: null,
  token: null,
  error: null,
  success: false,
};

const OLD_INITIAL_STATE = {
  id: null,
  token: null,
  email: null,
  family_name: null,
  given_name: null,
  display_name: null,
  profile_pic: null,
  roles: ['Viewer'],
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
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        authApiSlice.endpoints.refresh.matchFulfilled,
        (state, action) => {
          state.isLoading = false;
          state.token = action.payload.accessToken;
          state.user = jwtDecode(action.payload.accessToken);
          state.success = true;
        }
      )
      .addMatcher(authApiSlice.endpoints.refresh.matchPending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addMatcher(
        authApiSlice.endpoints.refresh.matchRejected,
        (state, action) => {
          state.error = action.payload;
          state.isLoading = false;
        }
      );
    /*
    [userLogin.pending]: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    [userLogin.fulfilled]: (state, action) => {
      state.isLoading = false;
      state.token = payload.action.accessToken;
      state.user = jwtDecode(payload.action.accessToken);
      state.success = true;
    },
    [userLogin.rejected]: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    }
      */
  },
});

export const { setCredentials, logout } = authSlice.actions;

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

export const selectCurrentEmail = (state) => state.auth.user.email;
export const selectCurrentUserId = (state) => state.auth.user.id;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRoles = (state) => state.auth.user.roles;

/**
 setCredentials: (state, action) => {
      //console.log('credentials payload:', action.payload);
      const { accessToken } = action.payload;
      const parsedToken = jwtDecode(accessToken);
      //state.id = parsedToken.id;
      //state.token = accessToken;
      const {
        id,
        email,
        profile_pic = null,
        family_name,
        given_name,
        display_name,
        roles,
      } = parsedToken;

      state.id = id;
      state.token = accessToken;
      state.email = email;
      state.family_name = family_name;
      state.given_name = given_name;
      state.display_name = display_name;
      state.profile_pic = profile_pic;
      state.roles = roles;
    },
    //COMMENT BACK OUT
    setUserData: (state, action) => {
      const {
        id,
        token,
        email,
        profile_pic = null,
        family_name,
        given_name,
        display_name,
        roles,
      } = action.payload;

      state.email = email;
      state.family_name = family_name;
      state.given_name = given_name;
      state.display_name = display_name;
      state.profile_pic = profile_pic;
      state.roles = roles;
    },
    //END BLOCK COMMENT
    logout: (state) => {
      state.id = null;
      state.token = null;
      state.email = null;
      state.profile_pic = null;
      state.family_name = null;
      state.given_name = null;
      state.display_name = null;
      state.roles = ['Viewer'];
    },
 */
