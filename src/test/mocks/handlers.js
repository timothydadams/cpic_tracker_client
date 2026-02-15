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
    focus_area: { id: 1, name: 'Housing & Neighborhoods' },
  },
  {
    id: 11,
    policy_number: 2,
    description: 'Policy B',
    focus_area_id: 1,
    focus_area: { id: 1, name: 'Housing & Neighborhoods' },
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

  // Auth refresh — returns 401 since tests use preloaded auth state
  http.post(`${API_URL}/auth/refresh`, () => {
    return HttpResponse.json({ message: 'No token' }, { status: 401 });
  }),
];
