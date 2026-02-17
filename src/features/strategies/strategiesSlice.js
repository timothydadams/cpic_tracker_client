import { createSlice, createSelector } from '@reduxjs/toolkit';
import { strategyApiSlice } from './strategiesApiSlice';

const strategySlice = createSlice({
  name: 'strategy',
  initialState: {
    strategies: [],
    assignedStrategies: [],
    statuses: [],
    timelineOptions: [],
  },
  reducers: {
    setStrategies: (state, action) => {
      state.strategies = action.payload;
    },
    setStatuses: (state, action) => {
      const { statuses } = action.payload;
      state.statuses = statuses;
    },
    setTimelineOptions: (state, action) => {
      const { options } = action.payload;
      state.timelineOptions = options;
    },
    setAssignedStrategies: (state, action) => {
      const { payload } = action;
      state.assignedStrategies = payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        strategyApiSlice.endpoints.getAllStatuses.matchFulfilled,
        (state, action) => {
          state.statuses = action.payload;
        }
      )
      .addMatcher(
        strategyApiSlice.endpoints.getAllTimelineOptions.matchFulfilled,
        (state, action) => {
          state.timelineOptions = action.payload;
        }
      )
      .addMatcher(
        strategyApiSlice.endpoints.getMyStrategies.matchFulfilled,
        (state, action) => {
          state.assignedStrategies = action.payload;
        }
      );
  },
});

export const {
  setStatuses,
  setTimelineOptions,
  setStrategies,
  setAssignedStrategies,
} = strategySlice.actions;

export default strategySlice.reducer;

const selectStrategyState = (state) => state.strategy;

export const selectStatuses = createSelector(
  [selectStrategyState],
  (strategy) => strategy.statuses
);
export const selectTimelineOpts = createSelector(
  [selectStrategyState],
  (strategy) => strategy.timelineOptions
);
export const selectAssignedStrategies = createSelector(
  [selectStrategyState],
  (strategy) => strategy.assignedStrategies
);
