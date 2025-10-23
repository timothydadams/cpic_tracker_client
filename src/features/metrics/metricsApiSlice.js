import { api } from '../../app/api/apiSlice';

export const metricsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getImplementerMetrics: builder.query({
      query: (params) => ({
        url: '/metrics/implementer-breakdown',
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getStrategyStatusMetrics: builder.query({
      query: (params) => ({
        url: '/metrics/strategies-by-status',
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
    getStrategyTimelineMetrics: builder.query({
      query: (params) => ({
        url: '/metrics/strategies-by-timeline',
        params,
      }),
      transformResponse: (response, meta, arg) => {
        return response.data;
      },
    }),
  }),
});

export const {
  useGetImplementerMetricsQuery,
  useGetStrategyStatusMetricsQuery,
  useGetStrategyTimelineMetricsQuery,
} = metricsApiSlice;
