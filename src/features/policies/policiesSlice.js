import { createSlice, createSelector } from '@reduxjs/toolkit';

const policySlice = createSlice({
  name: 'policies',
  initialState: {
    policies: [],
  },
  reducers: {
    setPolicies: (state, action) => {
      state.policies = action.payload;
    },
    resetPolicies: (state) => {
      state.policies = [];
    },
  },
});

export const { setPolicies, resetPolicies } = policySlice.actions;

export default policySlice.reducer;

export const selectPolicies = createSelector(
  [(state) => state.policies],
  (policies) => policies.policies
);
