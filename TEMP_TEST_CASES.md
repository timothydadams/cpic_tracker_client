# Test Cases: Admin CRUD Pages for Focus Areas, Policies, Implementers

> Temporary file — use these test cases as the basis for implementing automated tests
> with Vitest + React Testing Library once a test framework is configured.

---

## Test Framework Setup (TODO)

- Install: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`, `jsdom`, `msw` (Mock Service Worker)
- Configure `vitest.config.js` with jsdom environment and path aliases matching `webpack.config.js`
- Create test utilities: Redux store wrapper, RTK Query mock setup, authenticated user context provider

---

## 1. Unit Tests: Shared Components

### 1.1 ConfirmDeleteDialog (`src/components/ConfirmDeleteDialog.js`)

- [ ] Renders title and description when `open=true`
- [ ] Does not render content when `open=false`
- [ ] Cancel button calls `onOpenChange(false)`
- [ ] Confirm button calls `onConfirm` when clicked
- [ ] Confirm button is disabled when `isDeleting=true`
- [ ] Confirm button shows "Deleting..." text when `isDeleting=true`
- [ ] Cancel button is disabled when `isDeleting=true`

### 1.2 ResponsiveFormModal (`src/components/ResponsiveFormModal.js`)

- [ ] Renders Dialog on desktop (>768px)
- [ ] Renders Sheet on mobile (<=768px)
- [ ] Displays title and description in both modes
- [ ] Renders children content in both modes
- [ ] Calls `onOpenChange` when closed

---

## 2. Unit Tests: Focus Area Feature

### 2.1 FocusAreaForm (`src/features/focus_areas/FocusAreaForm.js`)

- [ ] Renders empty form fields in create mode (no `focusArea` prop)
- [ ] Pre-fills form fields in edit mode (with `focusArea` prop)
- [ ] Shows validation error when name is empty and form is submitted
- [ ] Calls `createFocusArea` mutation in create mode on valid submit
- [ ] Calls `updateFocusArea` mutation in edit mode on valid submit
- [ ] Only sends dirty fields in edit mode
- [ ] Shows success snackbar on successful create
- [ ] Shows success snackbar on successful update
- [ ] Shows error snackbar on mutation failure
- [ ] Calls `onSuccess` after successful mutation
- [ ] Calls `onCancel` when Cancel button is clicked
- [ ] Submit button is disabled when form is not dirty
- [ ] Submit button is disabled while mutation is in progress
- [ ] Submit button shows loading spinner while submitting

### 2.2 FocusAreaCard (`src/features/focus_areas/FocusAreaCard.js`)

- [ ] Renders focus area name as card title
- [ ] Renders description (or "No description" fallback)
- [ ] Renders state_goal when present
- [ ] Renders policy count badge with correct number
- [ ] Shows dropdown menu when `canEdit=true` or `canDelete=true`
- [ ] Hides dropdown menu when `canEdit=false` and `canDelete=false`
- [ ] Edit menu item calls `onEdit` with the focus area object
- [ ] Delete menu item calls `onDelete` with the focus area object
- [ ] Delete menu item hidden when `canDelete=false`
- [ ] Edit menu item hidden when `canEdit=false`

### 2.3 ManageFocusAreas (`src/features/focus_areas/ManageFocusAreas.js`)

- [ ] Shows loading skeleton while data is fetching
- [ ] Renders DataTable on desktop with correct columns
- [ ] Renders card grid on mobile
- [ ] Shows "Create Focus Area" button for Admin users
- [ ] Hides "Create Focus Area" button for non-Admin users
- [ ] Opening create form shows empty FocusAreaForm in modal
- [ ] Opening edit from row action shows pre-filled FocusAreaForm
- [ ] Delete action opens ConfirmDeleteDialog with correct item name
- [ ] Successful delete removes item and shows success snackbar
- [ ] Failed delete shows error snackbar
- [ ] Delete button only visible to Admin users in table actions
- [ ] Edit button only visible to Admin users in table actions

---

## 3. Unit Tests: Policy Feature

### 3.1 PolicyForm (`src/features/policies/PolicyForm.js`)

- [ ] Renders empty form fields in create mode
- [ ] Pre-fills form fields in edit mode
- [ ] Shows validation error for empty description
- [ ] Shows validation error for non-numeric policy_number
- [ ] Shows validation error for missing focus_area_id
- [ ] Populates focus area Select dropdown from API query
- [ ] Shows Skeleton while focus areas are loading
- [ ] Calls `createPolicy` mutation in create mode
- [ ] Calls `updatePolicy` mutation in edit mode
- [ ] Sends numeric values for policy_number and focus_area_id
- [ ] Shows success/error snackbar on mutation result
- [ ] Only sends dirty fields in edit mode

### 3.2 PolicyCard (`src/features/policies/PolicyCard.js`)

- [ ] Renders policy number in a badge
- [ ] Renders policy description as title
- [ ] Renders parent focus area name
- [ ] Shows dropdown menu based on canEdit/canDelete props
- [ ] Edit calls `onEdit` with policy object
- [ ] Delete calls `onDelete` with policy object

### 3.3 ManagePolicies (`src/features/policies/ManagePolicies.js`)

- [ ] Shows loading skeleton while data is fetching
- [ ] Renders DataTable on desktop, cards on mobile
- [ ] Shows "Create Policy" button for Admin and CPIC Admin users
- [ ] Hides "Create Policy" button for other roles
- [ ] Delete button only visible to Admin users
- [ ] Edit button visible to Admin and CPIC Admin users
- [ ] Default sort is by policy_number ascending
- [ ] Search filters by description text

---

## 4. Unit Tests: Implementer Feature

### 4.1 ImplementerForm (`src/features/implementers/ImplementerForm.js`)

- [ ] Renders empty form in create mode
- [ ] Pre-fills form in edit mode including emails and phone arrays
- [ ] Shows validation error for empty name
- [ ] Shows validation error for invalid email format
- [ ] "Add Email" button appends a new email input field
- [ ] Remove button removes the corresponding email field
- [ ] "Add Phone" button appends a new phone input field
- [ ] Remove button removes the corresponding phone field
- [ ] Dynamic arrays start with one empty field in create mode
- [ ] Checkbox fields toggle correctly (is_board, is_department, is_school)
- [ ] Calls `createImplementer` with flattened arrays on create
- [ ] Calls `updateImplementer` with only changed fields on edit
- [ ] Empty string values are filtered from email/phone arrays before submit
- [ ] Shows success/error snackbar on mutation result

### 4.2 ImplementerCard (`src/features/implementers/ImplementerCard.js`)

- [ ] Renders implementer name as title
- [ ] Renders type badges (Board, Department, School)
- [ ] Renders "Other" badge when no type flags are set
- [ ] Renders emails as comma-separated text
- [ ] Renders phone numbers as comma-separated text
- [ ] Shows dropdown menu based on canEdit/canDelete props
- [ ] Edit/Delete menu items call correct callbacks

### 4.3 ManageImplementers (`src/features/implementers/ManageImplementers.js`)

- [ ] Shows loading skeleton while data is fetching
- [ ] Renders DataTable on desktop, cards on mobile
- [ ] Shows "Create Implementer" button for Admin and CPIC Admin
- [ ] Delete button only visible to Admin users
- [ ] Edit button visible to Admin and CPIC Admin
- [ ] Search filters by implementer name

---

## 5. Integration Tests: RTK Query Cache Invalidation

### 5.1 API Slice Tag Configuration

- [ ] `focusAreaApiSlice.getAllFocusAreas` provides `FocusArea` tags (LIST + per-item)
- [ ] `focusAreaApiSlice.createFocusArea` invalidates `FocusArea LIST`
- [ ] `focusAreaApiSlice.updateFocusArea` invalidates specific `FocusArea` id + LIST
- [ ] `focusAreaApiSlice.deleteFocusArea` invalidates specific `FocusArea` id + LIST
- [ ] `policiesApiSlice.createPolicy` invalidates `Policy LIST` and `FocusArea LIST`
- [ ] `policiesApiSlice.updatePolicy` invalidates specific `Policy` id + LIST + `FocusArea LIST`
- [ ] `policiesApiSlice.deletePolicy` uses DELETE method (not PUT)
- [ ] `policiesApiSlice.deletePolicy` invalidates specific `Policy` id + LIST + `FocusArea LIST`
- [ ] `implementersApiSlice.createImplementer` invalidates `Implementer LIST`
- [ ] `implementersApiSlice.updateImplementer` invalidates specific `Implementer` id + LIST
- [ ] `implementersApiSlice.deleteImplementer` invalidates specific `Implementer` id + LIST

### 5.2 Cross-Feature Invalidation

- [ ] Creating a policy triggers refetch of focus areas list (when fetched with `policies: 'true'`)
- [ ] Deleting a policy triggers refetch of focus areas list
- [ ] Creating an implementer makes the new item appear on the Manage Implementers page without manual refresh

---

## 6. Integration Tests: Routing & Navigation

### 6.1 Route Protection

- [ ] `/admin/focus-areas` accessible to Admin users
- [ ] `/admin/focus-areas` accessible to CPIC Admin users
- [ ] `/admin/focus-areas` redirects Implementer users to /unauthorized
- [ ] `/admin/focus-areas` redirects unauthenticated users to /login
- [ ] `/admin/policies` same access rules as focus-areas
- [ ] `/admin/implementers` same access rules as focus-areas
- [ ] Existing `/admin/users` route still restricted to Admin only

### 6.2 Navigation Items

- [ ] Admin user sees "Manage Focus Areas", "Manage Policies", "Manage Implementers" in sidebar
- [ ] CPIC Admin user sees the same three nav items
- [ ] CPIC Member user does NOT see these nav items
- [ ] Implementer user does NOT see these nav items
- [ ] Guest/Viewer user does NOT see these nav items
- [ ] Unauthenticated user does NOT see these nav items
- [ ] Nav items link to correct routes

---

## 7. Integration Tests: Full CRUD Workflows (MSW-mocked API)

### 7.1 Focus Area CRUD

- [ ] Create: open modal, fill name + description, submit -> API POST called, list refreshes, modal closes
- [ ] Read: page loads, API GET called, data displayed in table/cards
- [ ] Update: click edit, change name, submit -> API PUT called with only changed fields, list refreshes
- [ ] Delete: click delete, confirm -> API DELETE called, item removed from list

### 7.2 Policy CRUD

- [ ] Create: open modal, fill description + number + focus area, submit -> API POST called
- [ ] Read: page loads with policies including parent focus area names
- [ ] Update: click edit, change description, submit -> API PUT called with dirty fields
- [ ] Delete: click delete, confirm -> API DELETE called

### 7.3 Implementer CRUD

- [ ] Create: open modal, fill name + emails + phone + checkboxes, submit -> API POST called with flattened arrays
- [ ] Read: page loads with implementer data and type badges
- [ ] Update: click edit, add email, toggle checkbox, submit -> API PUT called with changes
- [ ] Delete: click delete, confirm -> API DELETE called

---

## 8. Mobile-Specific Tests

### 8.1 Responsive Layout

- [ ] At 768px and below: card grid renders instead of DataTable (all 3 pages)
- [ ] At above 768px: DataTable renders instead of cards (all 3 pages)
- [ ] Cards show correct data and action menus

### 8.2 Mobile Form Experience

- [ ] Create/edit form opens as bottom Sheet on mobile (<=768px)
- [ ] Create/edit form opens as Dialog on desktop (>768px)
- [ ] Bottom Sheet is 85dvh tall and scrollable
- [ ] Form is fully usable in bottom Sheet (all fields reachable)

---

## 9. Accessibility Tests

- [ ] All form inputs have associated labels (htmlFor/id)
- [ ] Action buttons have aria-labels
- [ ] Dropdown menus are keyboard navigable
- [ ] AlertDialog traps focus when open
- [ ] Form validation errors are announced to screen readers (aria-invalid)
- [ ] Modal/Sheet has correct ARIA roles (dialog/alertdialog)

---

## 10. Manual Verification Checklist

1. [ ] `npm run dev` compiles without errors
2. [ ] Log in as Admin — all 3 nav items visible in Quick Actions sidebar
3. [ ] Log in as CPIC Admin — all 3 nav items visible
4. [ ] Log in as Implementer — nav items NOT visible
5. [ ] Navigate to /admin/focus-areas — DataTable loads on desktop
6. [ ] Resize to mobile — cards render instead of table
7. [ ] Create a focus area — appears in list, success toast shown
8. [ ] Edit a focus area — changes reflected, success toast shown
9. [ ] Delete a focus area (Admin only) — removed from list
10. [ ] Navigate to /admin/policies — DataTable loads sorted by policy number
11. [ ] Create a policy with focus area dropdown — appears in list
12. [ ] Edit a policy — changes reflected
13. [ ] Delete a policy (Admin only) — removed from list
14. [ ] Navigate to /admin/implementers — DataTable loads
15. [ ] Create implementer with emails, phones, checkboxes — appears in list
16. [ ] Edit implementer — add/remove emails works, checkbox toggles work
17. [ ] Delete implementer (Admin only) — removed from list
18. [ ] After creating a policy, go to Focus Areas page — nested policy count updated
19. [ ] CPIC Admin cannot see delete buttons on any page
20. [ ] CPIC Admin CAN see edit buttons on Policies and Implementers pages
21. [ ] `npm run build-prod` completes without errors
