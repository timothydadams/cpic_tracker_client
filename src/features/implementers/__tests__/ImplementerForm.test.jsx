import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ImplementerForm } from '../ImplementerForm';

describe('ImplementerForm', () => {
  const onSuccess = vi.fn();
  const onCancel = vi.fn();

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('create mode', () => {
    it('renders empty form with name field', () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(screen.getByLabelText('Name')).toHaveValue('');
    });

    it('shows "Create Implementer" submit button', () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(
        screen.getByRole('button', { name: /create implementer/i })
      ).toBeInTheDocument();
    });

    it('submit button is disabled when form is not dirty', () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(
        screen.getByRole('button', { name: /create implementer/i })
      ).toBeDisabled();
    });

    it('starts with one empty email field', () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const emailInputs = screen.getAllByPlaceholderText('email@example.com');
      expect(emailInputs).toHaveLength(1);
      expect(emailInputs[0]).toHaveValue('');
    });

    it('starts with one empty phone field', () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const phoneInputs = screen.getAllByPlaceholderText('(555) 123-4567');
      expect(phoneInputs).toHaveLength(1);
      expect(phoneInputs[0]).toHaveValue('');
    });

    it('"Add Email" button appends a new email field', async () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /add email/i }));

      const emailInputs = screen.getAllByPlaceholderText('email@example.com');
      expect(emailInputs).toHaveLength(2);
    });

    it('"Add Phone" button appends a new phone field', async () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /add phone/i }));

      const phoneInputs = screen.getAllByPlaceholderText('(555) 123-4567');
      expect(phoneInputs).toHaveLength(2);
    });

    it('remove button removes the corresponding email field', async () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      // Add a second email so remove buttons appear
      await user.click(screen.getByRole('button', { name: /add email/i }));
      expect(screen.getAllByPlaceholderText('email@example.com')).toHaveLength(
        2
      );

      // Click the first remove button
      const removeButtons = screen.getAllByRole('button', {
        name: /remove email/i,
      });
      await user.click(removeButtons[0]);

      expect(screen.getAllByPlaceholderText('email@example.com')).toHaveLength(
        1
      );
    });

    it('shows validation error for empty name on blur', async () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      const nameInput = screen.getByLabelText('Name');
      await user.type(nameInput, 'a');
      await user.clear(nameInput);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });

    it('renders checkbox fields for type', () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      expect(screen.getByText('Board')).toBeInTheDocument();
      expect(screen.getByText('Department')).toBeInTheDocument();
      expect(screen.getByText('School')).toBeInTheDocument();
    });

    it('calls onCancel when Cancel is clicked', async () => {
      render(<ImplementerForm onSuccess={onSuccess} onCancel={onCancel} />);
      const user = userEvent.setup();

      await user.click(screen.getByRole('button', { name: /cancel/i }));

      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('edit mode', () => {
    const existingImplementer = {
      id: 1,
      name: 'Planning Board',
      emails: ['planning@town.gov'],
      phone_numbers: ['555-0100'],
      is_board: true,
      is_department: false,
      is_school: false,
    };

    it('pre-fills form fields', async () => {
      render(
        <ImplementerForm
          implementer={existingImplementer}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        expect(screen.getByLabelText('Name')).toHaveValue('Planning Board');
      });
    });

    it('pre-fills email array', async () => {
      render(
        <ImplementerForm
          implementer={existingImplementer}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        const emailInputs = screen.getAllByPlaceholderText('email@example.com');
        expect(emailInputs[0]).toHaveValue('planning@town.gov');
      });
    });

    it('pre-fills phone array', async () => {
      render(
        <ImplementerForm
          implementer={existingImplementer}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      );
      await waitFor(() => {
        const phoneInputs = screen.getAllByPlaceholderText('(555) 123-4567');
        expect(phoneInputs[0]).toHaveValue('555-0100');
      });
    });

    it('shows "Save Changes" submit button', async () => {
      render(
        <ImplementerForm
          implementer={existingImplementer}
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
        <ImplementerForm
          implementer={existingImplementer}
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
