import { createSlice } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    id: null,
    token: null,
    email: null,
    family_name: null,
    given_name: null,
    display_name: null,
    profile_pic: null,
    roles: ['Viewer'],
  },
  reducers: {
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
    /*
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
    */
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
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;

export const selectUser = (state) => state.auth;
export const selectCurrentEmail = (state) => state.auth.email;
export const selectCurrentUserId = (state) => state.auth.id;
export const selectCurrentToken = (state) => state.auth.token;
export const selectCurrentRoles = (state) => state.auth.roles;
