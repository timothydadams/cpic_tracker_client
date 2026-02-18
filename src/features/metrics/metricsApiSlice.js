import { api } from '../../app/api/apiSlice';

export const metricsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    getImplementerMetrics: builder.query({
      query: (params) => ({
        url: '/metrics/implementer-breakdown',
        params,
      }),
      transformResponse: (response) => response.data,
    }),
    getStrategyStatsByImplementer: builder.query({
      query: (params) => ({
        url: '/metrics/strategy-stats-by-implementer',
        params,
      }),
      transformResponse: (response) => response.data,
    }),
    getStrategyStatusMetrics: builder.query({
      query: (params) => ({
        url: '/metrics/strategies-by-status',
        params,
      }),
      transformResponse: (response) => response.data,
    }),
    getStrategyTimelineMetrics: builder.query({
      query: (params) => ({
        url: '/metrics/strategies-by-timeline',
        params,
      }),
      transformResponse: (response) => response.data,
    }),
    getPlanOverview: builder.query({
      query: () => '/metrics/plan-overview',
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getCompletionByFocusArea: builder.query({
      query: () => '/metrics/completion-by-focus-area',
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getCompletionByTimeline: builder.query({
      query: () => '/metrics/completion-by-timeline',
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getDeadlineDrift: builder.query({
      query: () => '/metrics/deadline-drift',
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getOverdueStrategies: builder.query({
      query: (params) => ({
        url: '/metrics/overdue-strategies',
        params,
      }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 300,
    }),
    getImplementerScorecard: builder.query({
      query: (params) => ({
        url: '/metrics/implementer-scorecard',
        params,
      }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getImplementerScorecardDetail: builder.query({
      query: ({ implementerId, ...params }) => ({
        url: `/metrics/implementer-scorecard/${implementerId}`,
        params,
      }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getCompletionTrend: builder.query({
      query: (params) => ({
        url: '/metrics/completion-trend',
        params,
      }),
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
    getFocusAreaProgress: builder.query({
      query: () => '/metrics/focus-area-progress',
      transformResponse: (response) => response.data,
      keepUnusedDataFor: 600,
    }),
  }),
});

export const {
  useGetImplementerMetricsQuery,
  useGetStrategyStatsByImplementerQuery,
  useGetStrategyStatusMetricsQuery,
  useGetStrategyTimelineMetricsQuery,
  useGetPlanOverviewQuery,
  useGetCompletionByFocusAreaQuery,
  useGetCompletionByTimelineQuery,
  useGetDeadlineDriftQuery,
  useGetOverdueStrategiesQuery,
  useGetImplementerScorecardQuery,
  useGetImplementerScorecardDetailQuery,
  useGetCompletionTrendQuery,
  useGetFocusAreaProgressQuery,
} = metricsApiSlice;
