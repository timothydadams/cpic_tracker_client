import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ConfirmDeleteDialog } from '../ConfirmDeleteDialog';

describe('ConfirmDeleteDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn().mockResolvedValue(undefined),
    title: 'Delete Item',
    description: 'Are you sure you want to delete this?',
    isDeleting: false,
  };

  const renderDialog = (overrides = {}) => {
    const props = { ...defaultProps, ...overrides };
    defaultProps.onOpenChange.mockClear();
    defaultProps.onConfirm.mockClear();
    return render(<ConfirmDeleteDialog {...props} />);
  };

  it('renders title and description when open', () => {
    renderDialog();
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure you want to delete this?')
    ).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    renderDialog({ open: false });
    expect(screen.queryByText('Delete Item')).not.toBeInTheDocument();
  });

  it('calls onOpenChange(false) when Cancel is clicked', async () => {
    const onOpenChange = vi.fn();
    renderDialog({ onOpenChange });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /cancel/i }));

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('calls onConfirm when Delete is clicked', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderDialog({ onConfirm });
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /delete/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  it('disables confirm button when isDeleting is true', () => {
    renderDialog({ isDeleting: true });
    expect(screen.getByRole('button', { name: /deleting/i })).toBeDisabled();
  });

  it('disables cancel button when isDeleting is true', () => {
    renderDialog({ isDeleting: true });
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('shows "Deleting..." text when isDeleting is true', () => {
    renderDialog({ isDeleting: true });
    expect(screen.getByText('Deleting...')).toBeInTheDocument();
  });

  it('shows a spinner when isDeleting is true', () => {
    renderDialog({ isDeleting: true });
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses default title and description when not provided', () => {
    renderDialog({ title: undefined, description: undefined });
    expect(screen.getByText('Confirm Delete')).toBeInTheDocument();
    expect(
      screen.getByText('Are you sure? This action cannot be undone.')
    ).toBeInTheDocument();
  });
});
