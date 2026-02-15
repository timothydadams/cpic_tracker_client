import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { FocusAreaForm } from '../FocusAreaForm';

describe('FocusAreaForm', () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create mode', () => {
    it('renders empty form fields', () => {
      render(<FocusAreaForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(screen.getByLabelText('Name')).toHaveValue('');
      expect(screen.getByLabelText('Description')).toHaveValue('');
      expect(screen.getByLabelText('State Goal')).toHaveValue('');
    });

    it('shows "Create Focus Area" submit button', () => {
      render(<FocusAreaForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(
        screen.getByRole('button', { name: /create focus area/i })
      ).toBeInTheDocument();
    });

    it('submit button is disabled when form is not dirty', () => {
      render(<FocusAreaForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(
        screen.getByRole('button', { name: /create focus area/i })
      ).toBeDisabled();
    });

    it('shows validation error when name is empty and form is submitted', async () => {
      render(<FocusAreaForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      // Type and clear to trigger dirty + invalid state
      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'a');
      await user.clear(nameInput);
      await user.tab(); // blur to trigger validation

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('calls onCancel when Cancel button is clicked', async () => {
      render(<FocusAreaForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('edit mode', () => {
    const existingFocusArea = {
      id: 1,
      name: 'Housing',
      description: 'Housing desc',
      state_goal: 'Goal 1',
    };

    it('pre-fills form fields', async () => {
      render(
        <FocusAreaForm
          focusArea={existingFocusArea}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        expect(screen.getByLabelText('Name')).toHaveValue('Housing');
        expect(screen.getByLabelText('Description')).toHaveValue(
          'Housing desc'
        );
        expect(screen.getByLabelText('State Goal')).toHaveValue('Goal 1');
      });
    });

    it('shows "Save Changes" submit button', async () => {
      render(
        <FocusAreaForm
          focusArea={existingFocusArea}
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
        <FocusAreaForm
          focusArea={existingFocusArea}
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
