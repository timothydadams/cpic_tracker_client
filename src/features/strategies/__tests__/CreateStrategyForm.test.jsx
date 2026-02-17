import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { CreateStrategyForm } from '../CreateStrategyForm';
import { AUTH_STATES } from '../../../test/test-utils.jsx';

vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: () => false,
}));

describe('CreateStrategyForm', () => {
  const defaultProps = {
    onSuccess: vi.fn(),
    onCancel: vi.fn(),
  };

  const renderForm = () =>
    render(<CreateStrategyForm {...defaultProps} />, {
      preloadedState: { auth: AUTH_STATES.admin },
    });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders all form fields', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Focus Area')).toBeInTheDocument();
    });
    expect(screen.getByText('Policy')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Timeline')).toBeInTheDocument();
    expect(screen.getByText('Strategy Description')).toBeInTheDocument();
    expect(screen.getByText('Implementers')).toBeInTheDocument();
  });

  it('renders Cancel and Create Strategy buttons', async () => {
    renderForm();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('button', { name: /create strategy/i })
    ).toBeInTheDocument();
  });

  it('Create Strategy button is disabled initially', async () => {
    renderForm();
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /create strategy/i })
      ).toBeDisabled();
    });
  });

  it('calls onCancel when Cancel is clicked', async () => {
    renderForm();
    const user = userEvent.setup();

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /cancel/i })
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /cancel/i }));
    expect(defaultProps.onCancel).toHaveBeenCalledOnce();
  });

  it('policy dropdown is disabled before selecting a focus area', async () => {
    renderForm();
    await waitFor(() => {
      expect(screen.getByText('Select a focus area first')).toBeInTheDocument();
    });

    const policyTrigger = screen
      .getByText('Select a focus area first')
      .closest('button');
    expect(policyTrigger).toBeDisabled();
  });

  it('renders focus area and policy select triggers', async () => {
    renderForm();
    await waitFor(() => {
      expect(
        screen.getByRole('combobox', { name: /focus area/i })
      ).toBeInTheDocument();
    });
    expect(
      screen.getByRole('combobox', { name: /policy/i })
    ).toBeInTheDocument();
  });

  it('renders strategy description textarea', async () => {
    renderForm();
    await waitFor(() => {
      expect(
        screen.getByPlaceholderText('Describe the strategy...')
      ).toBeInTheDocument();
    });
  });
});
