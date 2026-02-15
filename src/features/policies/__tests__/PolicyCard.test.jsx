import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { PolicyCard } from '../PolicyCard';

describe('PolicyCard', () => {
  const mockPolicy = {
    id: 10,
    policy_number: 1,
    description: 'Improve housing quality',
    focus_area_id: 1,
    area: { id: 1, name: 'Housing & Neighborhoods' },
  };

  const defaultProps = {
    policy: mockPolicy,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders policy number in a badge', () => {
    render(<PolicyCard {...defaultProps} />);
    expect(screen.getByText('#1')).toBeInTheDocument();
  });

  it('renders policy description as title', () => {
    render(<PolicyCard {...defaultProps} />);
    expect(screen.getByText('Improve housing quality')).toBeInTheDocument();
  });

  it('renders parent focus area name', () => {
    render(<PolicyCard {...defaultProps} />);
    expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
  });

  it('shows dropdown menu based on canEdit/canDelete props', () => {
    render(<PolicyCard {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it('hides dropdown when canEdit=false and canDelete=false', () => {
    render(<PolicyCard {...defaultProps} canEdit={false} canDelete={false} />);
    expect(
      screen.queryByRole('button', { name: /open menu/i })
    ).not.toBeInTheDocument();
  });

  it('calls onEdit with policy when Edit is clicked', async () => {
    const onEdit = vi.fn();
    render(<PolicyCard {...defaultProps} onEdit={onEdit} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(mockPolicy);
  });

  it('calls onDelete with policy when Delete is clicked', async () => {
    const onDelete = vi.fn();
    render(<PolicyCard {...defaultProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith(mockPolicy);
  });

  it('hides Delete when canDelete=false', async () => {
    render(<PolicyCard {...defaultProps} canDelete={false} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  it('hides Edit when canEdit=false', async () => {
    render(<PolicyCard {...defaultProps} canEdit={false} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));

    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });
});
