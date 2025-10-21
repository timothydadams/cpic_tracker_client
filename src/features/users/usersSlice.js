import { createSlice } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: 'user',
  initialState: {
    id: null,
    email: null,
    family_name: null,
    given_name: null,
    display_name: null,
    roles: [],
  },
  reducers: {
    setUserDetails: (state, action) => {
      const {
        id,
        email,
        family_name,
        given_name,
        display_name,
        roles = [],
      } = action.payload;
      state.id = id;
      state.email = email;
      state.family_name = family_name;
      state.given_name = given_name;
      state.display_name = display_name;
      state.roles = roles;
    },
    resetUser: (state) => {
      state.id = null;
      state.email = null;
      state.family_name = null;
      state.given_name = null;
      state.display_name = null;
      state.roles = [];
    },
  },
});

export const { setUserDetails, resetUser } = userSlice.actions;

export default userSlice.reducer;

export const selectCurrentUser = (state) => state.user;
export const selectCurrentEmail = (state) => state.user.email;
export const selectCurrentUserId = (state) => state.user.id;
export const selectCurrentName = (state) => state.user.display_name;
export const selectCurrentRoles = (state) => state.user.roles;
