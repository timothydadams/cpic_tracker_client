import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { FocusAreaCard } from '../FocusAreaCard';

describe('FocusAreaCard', () => {
  const mockFocusArea = {
    id: 1,
    name: 'Housing & Neighborhoods',
    description: 'Improve housing quality and availability',
    state_goal: 'State Goal 1',
    policies: [
      { id: 10, policy_number: 1, description: 'Policy A' },
      { id: 11, policy_number: 2, description: 'Policy B' },
    ],
  };

  const defaultProps = {
    focusArea: mockFocusArea,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders focus area name as card title', () => {
    render(<FocusAreaCard {...defaultProps} />);
    expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
  });

  it('renders description', () => {
    render(<FocusAreaCard {...defaultProps} />);
    expect(
      screen.getByText('Improve housing quality and availability')
    ).toBeInTheDocument();
  });

  it('renders "No description" fallback when description is missing', () => {
    const fa = { ...mockFocusArea, description: null };
    render(<FocusAreaCard {...defaultProps} focusArea={fa} />);
    expect(screen.getByText('No description')).toBeInTheDocument();
  });

  it('renders state_goal when present', () => {
    render(<FocusAreaCard {...defaultProps} />);
    expect(screen.getByText('State Goal 1')).toBeInTheDocument();
  });

  it('does not render state_goal section when absent', () => {
    const fa = { ...mockFocusArea, state_goal: null };
    render(<FocusAreaCard {...defaultProps} focusArea={fa} />);
    expect(screen.queryByText('State Goal 1')).not.toBeInTheDocument();
  });

  it('renders policy count badge with correct number', () => {
    render(<FocusAreaCard {...defaultProps} />);
    expect(screen.getByText('2 policies')).toBeInTheDocument();
  });

  it('renders singular "policy" when count is 1', () => {
    const fa = { ...mockFocusArea, policies: [{ id: 10 }] };
    render(<FocusAreaCard {...defaultProps} focusArea={fa} />);
    expect(screen.getByText('1 policy')).toBeInTheDocument();
  });

  it('shows dropdown menu when canEdit or canDelete', () => {
    render(<FocusAreaCard {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it('hides dropdown menu when canEdit=false and canDelete=false', () => {
    render(
      <FocusAreaCard {...defaultProps} canEdit={false} canDelete={false} />
    );
    expect(
      screen.queryByRole('button', { name: /open menu/i })
    ).not.toBeInTheDocument();
  });

  it('calls onEdit with the focus area when Edit is clicked', async () => {
    const onEdit = vi.fn();
    render(<FocusAreaCard {...defaultProps} onEdit={onEdit} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(mockFocusArea);
  });

  it('calls onDelete with the focus area when Delete is clicked', async () => {
    const onDelete = vi.fn();
    render(<FocusAreaCard {...defaultProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith(mockFocusArea);
  });

  it('hides Delete menu item when canDelete=false', async () => {
    render(<FocusAreaCard {...defaultProps} canDelete={false} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('hides Edit menu item when canEdit=false', async () => {
    render(<FocusAreaCard {...defaultProps} canEdit={false} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
