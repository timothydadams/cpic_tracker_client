import { http, HttpResponse } from 'msw';

const API_URL = 'http://localhost:3500/api';

// ─── Fixture data ──────────────────────────────────────────
// Response shape matches backend: { status, message, data }
// RTK Query endpoints use transformResponse: res => res.data

export const mockFocusAreas = [
  {
    id: 1,
    name: 'Housing & Neighborhoods',
    description: 'Improve housing quality and availability',
    state_goal: 'State Goal 1',
    policies: [
      { id: 10, policy_number: 1, description: 'Policy A' },
      { id: 11, policy_number: 2, description: 'Policy B' },
    ],
  },
  {
    id: 2,
    name: 'Economic Development',
    description: 'Grow local economy',
    state_goal: null,
    policies: [],
  },
];

export const mockPolicies = [
  {
    id: 10,
    policy_number: 1,
    description: 'Policy A',
    focus_area_id: 1,
    area: { id: 1, name: 'Housing & Neighborhoods' },
  },
  {
    id: 11,
    policy_number: 2,
    description: 'Policy B',
    focus_area_id: 1,
    area: { id: 1, name: 'Housing & Neighborhoods' },
  },
  {
    id: 12,
    policy_number: 1,
    description: 'Policy C',
    focus_area_id: 2,
    area: { id: 2, name: 'Economic Development' },
  },
];

export const mockStatuses = [
  { id: '1', title: 'Not Started' },
  { id: '2', title: 'In Progress' },
  { id: '3', title: 'Completed' },
  { id: '4', title: 'Needs Updating' },
];

export const mockTimelineOptions = [
  { id: '1', title: 'Short-term (1-2 years)' },
  { id: '2', title: 'Mid-term (3-5 years)' },
  { id: '3', title: 'Long-term (5+ years)' },
  { id: '4', title: 'Ongoing' },
];

export const mockStrategies = [
  {
    id: 1,
    strategy_number: 1,
    content: 'Test strategy one',
    focus_area_id: 1,
    policy_id: 10,
    status_id: 2,
    timeline_id: 1,
    focus_area: { id: 1, name: 'Housing & Neighborhoods' },
    policy: { id: 10, policy_number: 1, description: 'Policy A' },
    status: { id: 2, title: 'In Progress' },
    timeline: { id: 1, title: 'Short-term (1-2 years)' },
    implementers: [
      { implementer_id: 1, implementer: { id: 1, name: 'Planning Board' } },
    ],
  },
];

export const mockImplementers = [
  {
    id: 1,
    name: 'Planning Board',
    is_board: true,
    is_department: false,
    is_school: false,
    emails: ['planning@town.gov'],
    phone_numbers: ['555-0100'],
  },
  {
    id: 2,
    name: 'Public Works',
    is_board: false,
    is_department: true,
    is_school: false,
    emails: ['pw@town.gov'],
    phone_numbers: [],
  },
];

// ─── Metrics fixture data ─────────────────────────────────

export const mockPlanOverview = {
  total_strategies: 85,
  completed: 22,
  in_progress: 40,
  needs_updating: 23,
  completion_rate: 25.9,
  on_time_completions: 18,
  late_completions: 4,
  on_time_rate: 81.8,
  overdue: 7,
  avg_days_to_complete: 142.5,
};

export const mockStrategiesByStatus = [
  { status: 'Needs Updating', count: 23 },
  { status: 'In Progress', count: 40 },
  { status: 'Completed', count: 22 },
];

export const mockStrategiesByTimeline = [
  { timeline: 'Short-Term', count: 30 },
  { timeline: 'Mid-Term', count: 25 },
  { timeline: 'Long-Term', count: 15 },
  { timeline: 'Ongoing', count: 15 },
];

export const mockCompletionByFocusArea = [
  {
    focus_area_id: 1,
    focus_area_name: 'Housing & Neighborhoods',
    total: 20,
    completed: 8,
    in_progress: 7,
    needs_updating: 5,
    completion_rate: 40.0,
    overdue: 2,
    avg_days_to_complete: 120.3,
  },
  {
    focus_area_id: 2,
    focus_area_name: 'Economic Development',
    total: 15,
    completed: 5,
    in_progress: 6,
    needs_updating: 4,
    completion_rate: 33.3,
    overdue: 1,
    avg_days_to_complete: 98.0,
  },
];

export const mockCompletionByTimeline = [
  {
    timeline_id: 1,
    timeline_name: 'Short-Term',
    deadline_date: '2026-08-31T16:00:00.000Z',
    total: 30,
    completed: 15,
    completion_rate: 50.0,
    overdue: 3,
    on_time_rate: 86.7,
    days_remaining: 195,
    avg_days_to_complete: 98.2,
  },
  {
    timeline_id: 2,
    timeline_name: 'Mid-Term',
    deadline_date: '2030-08-31T16:00:00.000Z',
    total: 25,
    completed: 5,
    completion_rate: 20.0,
    overdue: 0,
    on_time_rate: 100.0,
    days_remaining: 1656,
    avg_days_to_complete: 200.0,
  },
];

export const mockDeadlineDrift = {
  total_with_deadlines: 70,
  pushed: 12,
  push_rate: 17.1,
  avg_drift_days: 87.3,
  by_timeline: [
    {
      timeline_id: 1,
      timeline_name: 'Short-Term',
      total: 30,
      pushed: 5,
      push_rate: 16.7,
      avg_drift_days: 45.2,
    },
  ],
};

export const mockOverdueStrategies = [
  {
    strategy_id: 14,
    content: 'Develop teacher recruitment pipeline for underserved areas',
    focus_area: 'Housing & Neighborhoods',
    policy: 'Policy A',
    timeline: 'Short-Term',
    status: 'In Progress',
    current_deadline: '2026-01-15T00:00:00.000Z',
    days_overdue: 33,
    primary_implementer: 'Planning Board',
  },
];

export const mockImplementerScorecard = [
  {
    implementer_id: 1,
    implementer_name: 'Planning Board',
    overall: {
      total: 12,
      completed: 5,
      completion_rate: 41.7,
      on_time: 4,
      late: 1,
      on_time_rate: 80.0,
      overdue: 2,
      avg_days_to_complete: 134.2,
      score: 62.5,
      grade: 'D',
    },
    by_timeline: [],
  },
  {
    implementer_id: 2,
    implementer_name: 'Public Works',
    overall: {
      total: 8,
      completed: 6,
      completion_rate: 75.0,
      on_time: 6,
      late: 0,
      on_time_rate: 100.0,
      overdue: 0,
      avg_days_to_complete: 90.0,
      score: 92.5,
      grade: 'A',
    },
    by_timeline: [],
  },
];

export const mockImplementerScorecardDetail = {
  implementer_id: 1,
  implementer_name: 'Planning Board',
  overall: {
    total: 12,
    completed: 5,
    completion_rate: 41.7,
    on_time: 4,
    late: 1,
    on_time_rate: 80.0,
    overdue: 2,
    avg_days_to_complete: 134.2,
    score: 62.5,
    grade: 'D',
  },
  by_timeline: [
    {
      timeline_id: 1,
      timeline_name: 'Short-Term',
      total: 5,
      completed: 3,
      completion_rate: 60.0,
      on_time: 3,
      late: 0,
      on_time_rate: 100.0,
      overdue: 1,
      avg_days_to_complete: 98.0,
      score: 79.0,
      grade: 'C',
    },
  ],
  by_focus_area: [
    {
      focus_area_id: 1,
      focus_area_name: 'Housing & Neighborhoods',
      total: 4,
      completed: 2,
      completion_rate: 50.0,
      on_time: 2,
      late: 0,
      on_time_rate: 100.0,
      overdue: 0,
      avg_days_to_complete: 110.0,
      score: 82.5,
      grade: 'B',
    },
  ],
  recent_completions: [
    {
      strategy_id: 22,
      content: 'Complete housing inventory assessment',
      completed_at: '2025-11-15T00:00:00.000Z',
      focus_area: 'Housing & Neighborhoods',
      timeline: 'Short-Term',
      was_on_time: true,
    },
  ],
  overdue_strategies: [
    {
      strategy_id: 14,
      content: 'Develop teacher recruitment pipeline',
      current_deadline: '2026-01-15T00:00:00.000Z',
      days_overdue: 33,
      focus_area: 'Housing & Neighborhoods',
      timeline: 'Short-Term',
      status: 'In Progress',
    },
  ],
};

export const mockCompletionTrend = [
  { period: '2025-06', completed: 3, cumulative: 10 },
  { period: '2025-07', completed: 5, cumulative: 15 },
  { period: '2025-08', completed: 2, cumulative: 17 },
  { period: '2025-09', completed: 3, cumulative: 20 },
];

export const mockFocusAreaProgress = [
  {
    focus_area_id: 1,
    name: 'Housing & Neighborhoods',
    state_goal: 'State Goal 1',
    total_strategies: 20,
    completion_rate: 40.0,
    policies: [
      {
        policy_id: 'uuid-1',
        description: 'Policy A',
        policy_number: 1,
        total: 6,
        completed: 3,
        completion_rate: 50.0,
        overdue: 0,
      },
      {
        policy_id: 'uuid-2',
        description: 'Policy B',
        policy_number: 2,
        total: 4,
        completed: 1,
        completion_rate: 25.0,
        overdue: 1,
      },
    ],
  },
];

export const mockStrategyStatsByImplementer = [
  {
    id: 1,
    name: 'Planning Board',
    strategy_stats: { total: 12, inProgress: 5, completed: 5 },
  },
  {
    id: 2,
    name: 'Public Works',
    strategy_stats: { total: 8, inProgress: 2, completed: 6 },
  },
];

export const mockImplementerBreakdown = [
  { implementer_id: 1, implementer_name: 'Planning Board', count: 12 },
  { implementer_id: 2, implementer_name: 'Public Works', count: 8 },
];

// ─── Settings fixture data ────────────────────────────────

export const mockFeatureFlags = [
  {
    key: 'deadline_scheduler',
    enabled: true,
    description: 'Master switch for the daily deadline check cron job',
  },
  {
    key: 'deadline_reminders',
    enabled: true,
    description: 'Upcoming deadline and day-of reminder emails',
  },
  {
    key: 'overdue_notifications',
    enabled: false,
    description: 'Overdue strategy notification emails',
  },
];

export const mockScorecardConfig = {
  weight_completion_rate: 0.4,
  weight_on_time_rate: 0.35,
  weight_overdue_penalty: 0.25,
  grade_a_min: 90,
  grade_b_min: 80,
  grade_c_min: 70,
  grade_d_min: 60,
};

// ─── Registration fixture data ───────────────────────────

export const mockValidInviteCode = {
  valid: true,
  roleId: 'role-uuid-implementer',
  roleName: 'Implementer',
};

export const mockValidCPICInviteCode = {
  valid: true,
  roleId: 'role-uuid-cpic-member',
  roleName: 'CPIC Member',
};

export const mockRegisteredUser = {
  id: 'new-user-uuid',
  email: 'newuser@test.com',
  display_name: 'New User',
};

export const mockPasskeyRegOptions = {
  rp: { name: 'CPIC Tracker', id: 'localhost' },
  user: {
    id: 'dXNlci1pZA',
    name: 'newuser@test.com',
    displayName: 'New User',
  },
  challenge: 'dGVzdC1jaGFsbGVuZ2U',
  pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
  timeout: 60000,
  attestation: 'none',
};

export const mockPasskeyVerification = {
  verified: true,
  accessToken: 'fake-jwt-for-new-user',
};

// ─── Handlers ──────────────────────────────────────────────

export const handlers = [
  // Focus Areas
  http.get(`${API_URL}/focusareas`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockFocusAreas,
    });
  }),

  http.post(`${API_URL}/focusareas`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 201,
      message: 'Created',
      data: { id: Date.now(), policies: [], ...body },
    });
  }),

  http.put(`${API_URL}/focusareas/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 200,
      message: 'Updated',
      data: { id: Number(params.id), ...body },
    });
  }),

  http.delete(`${API_URL}/focusareas/:id`, ({ params }) => {
    return HttpResponse.json({
      status: 200,
      message: 'Deleted',
      data: { id: Number(params.id) },
    });
  }),

  // Policies
  http.get(`${API_URL}/policies`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockPolicies,
    });
  }),

  http.post(`${API_URL}/policies`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 201,
      message: 'Created',
      data: { id: Date.now(), ...body },
    });
  }),

  http.put(`${API_URL}/policies/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 200,
      message: 'Updated',
      data: { id: Number(params.id), ...body },
    });
  }),

  http.delete(`${API_URL}/policies/:id`, ({ params }) => {
    return HttpResponse.json({
      status: 200,
      message: 'Deleted',
      data: { id: Number(params.id) },
    });
  }),

  // Implementers
  http.get(`${API_URL}/implementers`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockImplementers,
    });
  }),

  http.post(`${API_URL}/implementers`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 201,
      message: 'Created',
      data: { id: Date.now(), ...body },
    });
  }),

  http.put(`${API_URL}/implementers/:id`, async ({ params, request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 200,
      message: 'Updated',
      data: { id: Number(params.id), ...body },
    });
  }),

  http.delete(`${API_URL}/implementers/:id`, ({ params }) => {
    return HttpResponse.json({
      status: 200,
      message: 'Deleted',
      data: { id: Number(params.id) },
    });
  }),

  // Strategies
  http.get(`${API_URL}/strategies`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockStrategies,
    });
  }),

  http.post(`${API_URL}/strategies`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 201,
      message: 'Created',
      data: { id: Date.now(), strategy_number: 1, ...body },
    });
  }),

  http.get(`${API_URL}/strategies/statuses`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockStatuses,
    });
  }),

  http.get(`${API_URL}/strategies/timeline_options`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockTimelineOptions,
    });
  }),

  // Metrics
  http.get(`${API_URL}/metrics/plan-overview`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockPlanOverview,
    });
  }),

  http.get(`${API_URL}/metrics/strategies-by-status`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockStrategiesByStatus,
    });
  }),

  http.get(`${API_URL}/metrics/strategies-by-timeline`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockStrategiesByTimeline,
    });
  }),

  http.get(`${API_URL}/metrics/completion-by-focus-area`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockCompletionByFocusArea,
    });
  }),

  http.get(`${API_URL}/metrics/completion-by-timeline`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockCompletionByTimeline,
    });
  }),

  http.get(`${API_URL}/metrics/deadline-drift`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockDeadlineDrift,
    });
  }),

  http.get(`${API_URL}/metrics/overdue-strategies`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockOverdueStrategies,
    });
  }),

  http.get(`${API_URL}/metrics/implementer-scorecard`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockImplementerScorecard,
    });
  }),

  http.get(`${API_URL}/metrics/implementer-scorecard/:id`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockImplementerScorecardDetail,
    });
  }),

  http.get(`${API_URL}/metrics/completion-trend`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockCompletionTrend,
    });
  }),

  http.get(`${API_URL}/metrics/focus-area-progress`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockFocusAreaProgress,
    });
  }),

  http.get(`${API_URL}/metrics/implementer-breakdown`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockImplementerBreakdown,
    });
  }),

  http.get(`${API_URL}/metrics/strategy-stats-by-implementer`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockStrategyStatsByImplementer,
    });
  }),

  // Feature Flags
  http.get(`${API_URL}/notifications/feature-flags`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockFeatureFlags,
    });
  }),

  http.put(
    `${API_URL}/notifications/feature-flags/:key`,
    async ({ params, request }) => {
      const body = await request.json();
      const flag = mockFeatureFlags.find((f) => f.key === params.key);
      return HttpResponse.json({
        status: 200,
        message: 'Updated',
        data: { ...flag, ...body },
      });
    }
  ),

  // Scorecard Config
  http.get(`${API_URL}/metrics/config/scorecard`, () => {
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockScorecardConfig,
    });
  }),

  http.put(`${API_URL}/metrics/config/scorecard`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 200,
      message: 'Updated',
      data: { ...mockScorecardConfig, ...body },
    });
  }),

  // Auth refresh — returns 401 since tests use preloaded auth state
  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({ message: 'No token' }, { status: 401 });
  }),

  // Invite validation
  http.get(`${API_URL}/invites/:code/validate`, ({ params }) => {
    if (params.code === 'INVALID_CODE') {
      return HttpResponse.json(
        { status: 400, message: 'Invalid or expired invite code', data: null },
        { status: 400 }
      );
    }
    if (params.code === 'CPIC_CODE') {
      return HttpResponse.json({
        status: 200,
        message: 'Success',
        data: mockValidCPICInviteCode,
      });
    }
    return HttpResponse.json({
      status: 200,
      message: 'Success',
      data: mockValidInviteCode,
    });
  }),

  // Registration
  http.post(`${API_URL}/auth/register`, async ({ request }) => {
    const body = await request.json();
    return HttpResponse.json({
      status: 200,
      message: 'User created',
      data: {
        ...mockRegisteredUser,
        email: body.user?.email || mockRegisteredUser.email,
      },
    });
  }),

  // Passkey registration options
  http.post(`${API_URL}/auth/generate-passkey-reg-options`, () => {
    return HttpResponse.json(mockPasskeyRegOptions);
  }),

  // Passkey registration verification
  http.post(`${API_URL}/auth/passkey-reg-verification`, () => {
    return HttpResponse.json(mockPasskeyVerification);
  }),
];
