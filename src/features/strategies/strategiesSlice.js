import { createSlice } from '@reduxjs/toolkit';
import { strategyApiSlice } from './strategiesApiSlice';

const strategySlice = createSlice({
  name: 'strategy',
  initialState: {
    strategies: [],
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
      );
  },
});

export const { setStatuses, setTimelineOptions } = strategySlice.actions;

export default strategySlice.reducer;

export const selectStatuses = (state) => state.strategy.statuses;
export const selectTimelineOpts = (state) => state.strategy.timelineOptions;
