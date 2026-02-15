import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { PolicyForm } from '../PolicyForm';

describe('PolicyForm', () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create mode', () => {
    it('renders empty form fields', async () => {
      render(<PolicyForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('Policy Number')).toHaveValue(null);
    });

    it('shows "Create Policy" submit button', () => {
      render(<PolicyForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(
        screen.getByRole('button', { name: /create policy/i })
      ).toBeInTheDocument();
    });

    it('submit button is disabled when form is not dirty', () => {
      render(<PolicyForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(
        screen.getByRole('button', { name: /create policy/i })
      ).toBeDisabled();
    });

    it('populates focus area dropdown from API', async () => {
      render(<PolicyForm onSuccess={onSuccess} onCancel={onCancel} />);
      // Wait for focus areas to load from MSW
      await waitFor(() => {
        expect(screen.getByText('Select focus area')).toBeInTheDocument();
      });
    });

    it('shows validation error for empty description on blur', async () => {
      render(<PolicyForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      const desc = screen.getByLabelText('Description');
      await user.type(desc, 'a');
      await user.clear(desc);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Description is required')).toBeInTheDocument();
      });
    });

    it('calls onCancel when Cancel button is clicked', async () => {
      render(<PolicyForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('edit mode', () => {
    const existingPolicy = {
      id: 10,
      description: 'Improve housing quality',
      policy_number: 1,
      focus_area_id: 1,
    };

    it('pre-fills form fields', async () => {
      render(
        <PolicyForm
          policy={existingPolicy}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        expect(screen.getByLabelText('Description')).toHaveValue(
          'Improve housing quality'
        );
        expect(screen.getByLabelText('Policy Number')).toHaveValue(1);
      });
    });

    it('shows "Save Changes" submit button', async () => {
      render(
        <PolicyForm
          policy={existingPolicy}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /save changes/i })
        ).toBeInTheDocument();
      });
    });

    it('submit button is disabled when form is not dirty', async () => {
      render(
        <PolicyForm
          policy={existingPolicy}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /save changes/i })
        ).toBeDisabled();
      });
    });
  });
});
