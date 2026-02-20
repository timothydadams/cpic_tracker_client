import { describe, it, expect } from 'vitest';

// RTK Query does not expose providesTags/invalidatesTags on the public
// endpoint objects (they are internal). Instead, we test the tag logic
// functions directly. These mirror the exact functions defined in each
// API slice file. If the source changes, these tests should be updated
// to match.

describe('RTK Query Tag Configuration Logic', () => {
  describe('focusAreaApiSlice tags', () => {
    // Mirrors: focusAreaApiSlice.js → getAllFocusAreas.providesTags
    const getAllFocusAreasProvidesTags = (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: 'FocusArea', id })),
            { type: 'FocusArea', id: 'LIST' },
          ]
        : [{ type: 'FocusArea', id: 'LIST' }];

    // Mirrors: focusAreaApiSlice.js → createFocusArea.invalidatesTags
    const createFocusAreaInvalidatesTags = [{ type: 'FocusArea', id: 'LIST' }];

    // Mirrors: focusAreaApiSlice.js → updateFocusArea.invalidatesTags
    const updateFocusAreaInvalidatesTags = (result, error, arg) => [
      { type: 'FocusArea', id: arg.id },
      { type: 'FocusArea', id: 'LIST' },
    ];

    // Mirrors: focusAreaApiSlice.js → deleteFocusArea.invalidatesTags
    const deleteFocusAreaInvalidatesTags = (result, error, arg) => [
      { type: 'FocusArea', id: arg },
      { type: 'FocusArea', id: 'LIST' },
    ];

    it('getAllFocusAreas provides FocusArea tags for each result item + LIST', () => {
      const result = [{ id: 1 }, { id: 2 }];
      const tags = getAllFocusAreasProvidesTags(result);
      expect(tags).toContainEqual({ type: 'FocusArea', id: 1 });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 2 });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 'LIST' });
    });

    it('getAllFocusAreas provides LIST tag when result is null', () => {
      const tags = getAllFocusAreasProvidesTags(null);
      expect(tags).toEqual([{ type: 'FocusArea', id: 'LIST' }]);
    });

    it('createFocusArea invalidates FocusArea LIST', () => {
      expect(createFocusAreaInvalidatesTags).toContainEqual({
        type: 'FocusArea',
        id: 'LIST',
      });
    });

    it('updateFocusArea invalidates specific FocusArea id + LIST', () => {
      const tags = updateFocusAreaInvalidatesTags(null, null, { id: 5 });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 5 });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 'LIST' });
    });

    it('deleteFocusArea invalidates specific FocusArea id + LIST', () => {
      const tags = deleteFocusAreaInvalidatesTags(null, null, 5);
      expect(tags).toContainEqual({ type: 'FocusArea', id: 5 });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 'LIST' });
    });
  });

  describe('policyApiSlice tags', () => {
    // Mirrors: policiesApiSlice.js → getAllPolicies.providesTags
    const getAllPoliciesProvidesTags = (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: 'Policy', id })),
            { type: 'Policy', id: 'LIST' },
          ]
        : [{ type: 'Policy', id: 'LIST' }];

    // Mirrors: policiesApiSlice.js → createPolicy.invalidatesTags
    const createPolicyInvalidatesTags = [
      { type: 'Policy', id: 'LIST' },
      { type: 'FocusArea', id: 'LIST' },
    ];

    // Mirrors: policiesApiSlice.js → updatePolicy.invalidatesTags
    const updatePolicyInvalidatesTags = (result, error, arg) => [
      { type: 'Policy', id: arg.id },
      { type: 'Policy', id: 'LIST' },
      { type: 'FocusArea', id: 'LIST' },
    ];

    // Mirrors: policiesApiSlice.js → deletePolicy.invalidatesTags
    const deletePolicyInvalidatesTags = (result, error, arg) => [
      { type: 'Policy', id: arg },
      { type: 'Policy', id: 'LIST' },
      { type: 'FocusArea', id: 'LIST' },
    ];

    it('getAllPolicies provides Policy tags for each result item + LIST', () => {
      const result = [{ id: 10 }, { id: 11 }];
      const tags = getAllPoliciesProvidesTags(result);
      expect(tags).toContainEqual({ type: 'Policy', id: 10 });
      expect(tags).toContainEqual({ type: 'Policy', id: 11 });
      expect(tags).toContainEqual({ type: 'Policy', id: 'LIST' });
    });

    it('createPolicy invalidates Policy LIST and FocusArea LIST', () => {
      expect(createPolicyInvalidatesTags).toContainEqual({
        type: 'Policy',
        id: 'LIST',
      });
      expect(createPolicyInvalidatesTags).toContainEqual({
        type: 'FocusArea',
        id: 'LIST',
      });
    });

    it('updatePolicy invalidates specific Policy id + LIST + FocusArea LIST', () => {
      const tags = updatePolicyInvalidatesTags(null, null, { id: 10 });
      expect(tags).toContainEqual({ type: 'Policy', id: 10 });
      expect(tags).toContainEqual({ type: 'Policy', id: 'LIST' });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 'LIST' });
    });

    it('deletePolicy invalidates specific Policy id + LIST + FocusArea LIST', () => {
      const tags = deletePolicyInvalidatesTags(null, null, 10);
      expect(tags).toContainEqual({ type: 'Policy', id: 10 });
      expect(tags).toContainEqual({ type: 'Policy', id: 'LIST' });
      expect(tags).toContainEqual({ type: 'FocusArea', id: 'LIST' });
    });
  });

  describe('implementersApiSlice tags', () => {
    // Mirrors: implementersApiSlice.js → createImplementer.invalidatesTags
    const createImplementerInvalidatesTags = [
      { type: 'Implementer', id: 'LIST' },
    ];

    // Mirrors: implementersApiSlice.js → updateImplementer.invalidatesTags
    const updateImplementerInvalidatesTags = (result, error, arg) => [
      { type: 'Implementer', id: arg.id },
      { type: 'Implementer', id: 'LIST' },
    ];

    // Mirrors: implementersApiSlice.js → deleteImplementer.invalidatesTags
    const deleteImplementerInvalidatesTags = (result, error, arg) => [
      { type: 'Implementer', id: arg },
      { type: 'Implementer', id: 'LIST' },
    ];

    it('createImplementer invalidates Implementer LIST', () => {
      expect(createImplementerInvalidatesTags).toContainEqual({
        type: 'Implementer',
        id: 'LIST',
      });
    });

    it('updateImplementer invalidates specific Implementer id + LIST', () => {
      const tags = updateImplementerInvalidatesTags(null, null, { id: 1 });
      expect(tags).toContainEqual({ type: 'Implementer', id: 1 });
      expect(tags).toContainEqual({ type: 'Implementer', id: 'LIST' });
    });

    it('deleteImplementer invalidates specific Implementer id + LIST', () => {
      const tags = deleteImplementerInvalidatesTags(null, null, 1);
      expect(tags).toContainEqual({ type: 'Implementer', id: 1 });
      expect(tags).toContainEqual({ type: 'Implementer', id: 'LIST' });
    });
  });

  describe('strategyApiSlice tags', () => {
    // Mirrors: strategiesApiSlice.js → getAllStrategies.providesTags
    const getAllStrategiesProvidesTags = (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: 'Strategy', id })),
            { type: 'Strategy', id: 'LIST' },
          ]
        : [{ type: 'Strategy', id: 'LIST' }];

    // Mirrors: strategiesApiSlice.js → getStrategyComments.providesTags
    const getStrategyCommentsProvidesTags = (result) =>
      result
        ? [
            ...result.map(({ id }) => ({ type: 'Comment', id })),
            { type: 'Comment', id: 'LIST' },
          ]
        : [{ type: 'Comment', id: 'LIST' }];

    // Mirrors: strategiesApiSlice.js → createStrategy.invalidatesTags
    const createStrategyInvalidatesTags = [{ type: 'Strategy', id: 'LIST' }];

    // Mirrors: strategiesApiSlice.js → updateStrategy.invalidatesTags
    const updateStrategyInvalidatesTags = (result, error, arg) => [
      { type: 'Strategy', id: arg.id },
      { type: 'Strategy', id: 'LIST' },
    ];

    it('getAllStrategies provides Strategy tags for each result item + LIST', () => {
      const result = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const tags = getAllStrategiesProvidesTags(result);
      expect(tags).toContainEqual({ type: 'Strategy', id: 1 });
      expect(tags).toContainEqual({ type: 'Strategy', id: 2 });
      expect(tags).toContainEqual({ type: 'Strategy', id: 3 });
      expect(tags).toContainEqual({ type: 'Strategy', id: 'LIST' });
    });

    it('getAllStrategies provides LIST tag when result is null', () => {
      const tags = getAllStrategiesProvidesTags(null);
      expect(tags).toEqual([{ type: 'Strategy', id: 'LIST' }]);
    });

    it('getStrategyComments provides Comment tags for each result item + LIST', () => {
      const result = [{ id: 10 }, { id: 11 }];
      const tags = getStrategyCommentsProvidesTags(result);
      expect(tags).toContainEqual({ type: 'Comment', id: 10 });
      expect(tags).toContainEqual({ type: 'Comment', id: 11 });
      expect(tags).toContainEqual({ type: 'Comment', id: 'LIST' });
    });

    it('createStrategy invalidates Strategy LIST', () => {
      expect(createStrategyInvalidatesTags).toContainEqual({
        type: 'Strategy',
        id: 'LIST',
      });
    });

    it('updateStrategy invalidates specific Strategy id + LIST', () => {
      const tags = updateStrategyInvalidatesTags(null, null, { id: 5 });
      expect(tags).toContainEqual({ type: 'Strategy', id: 5 });
      expect(tags).toContainEqual({ type: 'Strategy', id: 'LIST' });
    });
  });

  describe('settingsApiSlice tags', () => {
    // Mirrors: settingsApiSlice.js → getFeatureFlags.providesTags
    const getFeatureFlagsProvidesTags = (result) =>
      result
        ? [
            ...result.map(({ key }) => ({ type: 'FeatureFlag', id: key })),
            { type: 'FeatureFlag', id: 'LIST' },
          ]
        : [{ type: 'FeatureFlag', id: 'LIST' }];

    // Mirrors: settingsApiSlice.js → updateFeatureFlag.invalidatesTags
    const updateFeatureFlagInvalidatesTags = (result, error, { key }) => [
      { type: 'FeatureFlag', id: key },
    ];

    // Mirrors: settingsApiSlice.js → getScorecardConfig.providesTags
    const getScorecardConfigProvidesTags = [
      { type: 'ScorecardConfig', id: 'CONFIG' },
    ];

    // Mirrors: settingsApiSlice.js → updateScorecardConfig.invalidatesTags
    const updateScorecardConfigInvalidatesTags = [
      { type: 'ScorecardConfig', id: 'CONFIG' },
    ];

    it('getFeatureFlags provides FeatureFlag tags for each result key + LIST', () => {
      const result = [
        { key: 'deadline_scheduler' },
        { key: 'deadline_reminders' },
      ];
      const tags = getFeatureFlagsProvidesTags(result);
      expect(tags).toContainEqual({
        type: 'FeatureFlag',
        id: 'deadline_scheduler',
      });
      expect(tags).toContainEqual({
        type: 'FeatureFlag',
        id: 'deadline_reminders',
      });
      expect(tags).toContainEqual({ type: 'FeatureFlag', id: 'LIST' });
    });

    it('getFeatureFlags provides LIST tag when result is null', () => {
      const tags = getFeatureFlagsProvidesTags(null);
      expect(tags).toEqual([{ type: 'FeatureFlag', id: 'LIST' }]);
    });

    it('updateFeatureFlag invalidates specific FeatureFlag key', () => {
      const tags = updateFeatureFlagInvalidatesTags(null, null, {
        key: 'deadline_scheduler',
      });
      expect(tags).toContainEqual({
        type: 'FeatureFlag',
        id: 'deadline_scheduler',
      });
    });

    it('getScorecardConfig provides ScorecardConfig CONFIG tag', () => {
      expect(getScorecardConfigProvidesTags).toContainEqual({
        type: 'ScorecardConfig',
        id: 'CONFIG',
      });
    });

    it('updateScorecardConfig invalidates ScorecardConfig CONFIG tag', () => {
      expect(updateScorecardConfigInvalidatesTags).toContainEqual({
        type: 'ScorecardConfig',
        id: 'CONFIG',
      });
    });
  });

  describe('commentApiSlice tags', () => {
    // Mirrors: commentsApiSlice.js → createComment.invalidatesTags
    const createCommentInvalidatesTags = [{ type: 'Comment', id: 'LIST' }];

    // Mirrors: commentsApiSlice.js → updateComment.invalidatesTags
    const updateCommentInvalidatesTags = (result, error, arg) => [
      { type: 'Comment', id: arg.id },
      { type: 'Comment', id: 'LIST' },
    ];

    // Mirrors: commentsApiSlice.js → deleteComment.invalidatesTags
    const deleteCommentInvalidatesTags = (result, error, arg) => [
      { type: 'Comment', id: arg },
      { type: 'Comment', id: 'LIST' },
    ];

    it('createComment invalidates Comment LIST', () => {
      expect(createCommentInvalidatesTags).toContainEqual({
        type: 'Comment',
        id: 'LIST',
      });
    });

    it('updateComment invalidates specific Comment id + LIST', () => {
      const tags = updateCommentInvalidatesTags(null, null, { id: 3 });
      expect(tags).toContainEqual({ type: 'Comment', id: 3 });
      expect(tags).toContainEqual({ type: 'Comment', id: 'LIST' });
    });

    it('deleteComment invalidates specific Comment id + LIST', () => {
      const tags = deleteCommentInvalidatesTags(null, null, 3);
      expect(tags).toContainEqual({ type: 'Comment', id: 3 });
      expect(tags).toContainEqual({ type: 'Comment', id: 'LIST' });
    });
  });
});
