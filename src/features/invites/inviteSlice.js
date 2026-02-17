import { createSlice } from '@reduxjs/toolkit';

const inviteSlice = createSlice({
  name: 'invites',
  initialState: {
    invites: [],
  },
  reducers: {
    setInvites: (state, action) => {
      state.invites = action.payload;
    },
    resetInvites: (state) => {
      state.invites = [];
    },
  },
});

export const { setInvites, resetInvites } = inviteSlice.actions;

export default inviteSlice.reducer;

export const selectInviteCodes = (state) => state.invites.invites;
