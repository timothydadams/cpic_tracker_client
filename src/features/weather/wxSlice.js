import { createSlice, current } from '@reduxjs/toolkit';

const initialState = {
  maxWind: 5,
  maxAlt: 400,
};

const wxSlice = createSlice({
  name: 'wx',
  initialState,
  reducers: {
    setLimits: (state, action) => {
      const { maxWind, maxAlt } = action.payload;
      state.maxWind = maxWind;
      state.maxAlt = maxAlt;
    },
    resetWx: (state) => {
      return initialState;
    },
  },
});

export const { setLimits, resetWx } = wxSlice.actions;

export default wxSlice.reducer;

export const selectCurrentWind = (state) => state.wx.maxWind;
export const selectCurrentAlt = (state) => state.wx.maxAlt;
export const selectCurrentLimits = (state) => state.wx;
