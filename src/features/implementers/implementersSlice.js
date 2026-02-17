import { createSlice, createSelector } from '@reduxjs/toolkit';

const implementerSlice = createSlice({
  name: 'implementer',
  initialState: {
    implementers: [],
  },
  reducers: {
    setImplementers: (state, action) => {
      const { data } = action.payload;
      state.implementers = data;
    },
    resetImplementers: (state) => {
      state.implementers = [];
    },
  },
});

export const { setImplementers, resetImplementers } = implementerSlice.actions;

export default implementerSlice.reducer;

export const selectImplementers = createSelector(
  [(state) => state.implementers],
  (implementers) => implementers.implementers
);
