import { api } from '../../app/api/apiSlice';

export const settingsApiSlice = api.injectEndpoints({
  endpoints: (builder) => ({
    // --- Notification Feature Flags ---
    getFeatureFlags: builder.query({
      query: () => '/notifications/feature-flags',
      transformResponse: (response) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ key }) => ({ type: 'FeatureFlag', id: key })),
              { type: 'FeatureFlag', id: 'LIST' },
            ]
          : [{ type: 'FeatureFlag', id: 'LIST' }],
      keepUnusedDataFor: 3600,
    }),

    updateFeatureFlag: builder.mutation({
      query: ({ key, enabled }) => ({
        url: `/notifications/feature-flags/${key}`,
        method: 'PUT',
        body: { enabled },
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: (result, error, { key }) => [
        { type: 'FeatureFlag', id: key },
      ],
    }),

    // --- Scorecard Configuration ---
    getScorecardConfig: builder.query({
      query: () => '/metrics/config/scorecard',
      transformResponse: (response) => response.data,
      providesTags: [{ type: 'ScorecardConfig', id: 'CONFIG' }],
      keepUnusedDataFor: 3600,
    }),

    updateScorecardConfig: builder.mutation({
      query: (data) => ({
        url: '/metrics/config/scorecard',
        method: 'PUT',
        body: data,
      }),
      transformResponse: (response) => response.data,
      invalidatesTags: [
        { type: 'ScorecardConfig', id: 'CONFIG' },
        { type: 'ImplementerScorecard', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
  useGetScorecardConfigQuery,
  useUpdateScorecardConfigMutation,
} = settingsApiSlice;
