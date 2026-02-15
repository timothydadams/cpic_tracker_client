import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ImplementerCard } from '../ImplementerCard';

describe('ImplementerCard', () => {
  const mockImplementer = {
    id: 1,
    name: 'Planning Board',
    is_board: true,
    is_department: false,
    is_school: false,
    emails: ['planning@town.gov', 'admin@town.gov'],
    phone_numbers: ['555-0100', '555-0200'],
  };

  const defaultProps = {
    implementer: mockImplementer,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    canEdit: true,
    canDelete: true,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders implementer name as title', () => {
    render(<ImplementerCard {...defaultProps} />);
    expect(screen.getByText('Planning Board')).toBeInTheDocument();
  });

  it('renders type badge for Board', () => {
    render(<ImplementerCard {...defaultProps} />);
    expect(screen.getByText('Board')).toBeInTheDocument();
  });

  it('renders type badge for Department', () => {
    const impl = { ...mockImplementer, is_board: false, is_department: true };
    render(<ImplementerCard {...defaultProps} implementer={impl} />);
    expect(screen.getByText('Department')).toBeInTheDocument();
  });

  it('renders type badge for School', () => {
    const impl = { ...mockImplementer, is_board: false, is_school: true };
    render(<ImplementerCard {...defaultProps} implementer={impl} />);
    expect(screen.getByText('School')).toBeInTheDocument();
  });

  it('renders "Other" badge when no type flags are set', () => {
    const impl = {
      ...mockImplementer,
      is_board: false,
      is_department: false,
      is_school: false,
    };
    render(<ImplementerCard {...defaultProps} implementer={impl} />);
    expect(screen.getByText('Other')).toBeInTheDocument();
  });

  it('renders emails as comma-separated text', () => {
    render(<ImplementerCard {...defaultProps} />);
    expect(
      screen.getByText('planning@town.gov, admin@town.gov')
    ).toBeInTheDocument();
  });

  it('renders phone numbers as comma-separated text', () => {
    render(<ImplementerCard {...defaultProps} />);
    expect(screen.getByText('555-0100, 555-0200')).toBeInTheDocument();
  });

  it('shows dropdown menu based on canEdit/canDelete props', () => {
    render(<ImplementerCard {...defaultProps} />);
    expect(
      screen.getByRole('button', { name: /open menu/i })
    ).toBeInTheDocument();
  });

  it('hides dropdown when canEdit=false and canDelete=false', () => {
    render(
      <ImplementerCard {...defaultProps} canEdit={false} canDelete={false} />
    );
    expect(
      screen.queryByRole('button', { name: /open menu/i })
    ).not.toBeInTheDocument();
  });

  it('calls onEdit with implementer when Edit is clicked', async () => {
    const onEdit = vi.fn();
    render(<ImplementerCard {...defaultProps} onEdit={onEdit} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByText('Edit'));

    expect(onEdit).toHaveBeenCalledWith(mockImplementer);
  });

  it('calls onDelete with implementer when Delete is clicked', async () => {
    const onDelete = vi.fn();
    render(<ImplementerCard {...defaultProps} onDelete={onDelete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /open menu/i }));
    await user.click(screen.getByText('Delete'));

    expect(onDelete).toHaveBeenCalledWith(mockImplementer);
  });
});
