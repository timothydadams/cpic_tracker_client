import { createSlice, createSelector } from '@reduxjs/toolkit';

const focusAreaSlice = createSlice({
  name: 'focusArea',
  initialState: {
    focusAreas: [],
  },
  reducers: {
    setFocusAreas: (state, action) => {
      state.focusAreas = action.payload;
    },
    resetFocusAreas: (state) => {
      state.focusAreas = [];
    },
  },
});

export const { setFocusAreas, resetFocusAreas } = focusAreaSlice.actions;

export default focusAreaSlice.reducer;

export const selectFocusAreas = createSelector(
  [(state) => state.focusAreas],
  (focusAreas) => focusAreas.focusAreas
);
