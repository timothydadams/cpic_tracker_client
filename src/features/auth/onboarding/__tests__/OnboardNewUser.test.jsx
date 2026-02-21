import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../../test/test-utils.jsx';
import { AUTH_STATES } from '../../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { server } from '../../../../test/mocks/server';
import { http, HttpResponse } from 'msw';
import { OnboardingForm } from '../OnboardNewUser';

const API_URL = 'http://localhost:3500/api';

vi.mock('@simplewebauthn/browser', () => ({
  startRegistration: vi.fn().mockResolvedValue({
    id: 'mock-credential-id',
    rawId: 'mock-raw-id',
    response: {
      attestationObject: 'mock-attestation',
      clientDataJSON: 'mock-client-data',
    },
    type: 'public-key',
  }),
}));

vi.mock('hooks/usePersist', () => ({
  default: () => ['SHORT', vi.fn()],
}));

describe('OnboardingForm', () => {
  const renderForm = (route = '/register') =>
    render(<OnboardingForm />, {
      preloadedState: { auth: AUTH_STATES.guest },
      route,
    });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders invite code step initially', () => {
    renderForm();

    expect(screen.getByText('Invite Code')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('enter your invite code here and verify')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /verify code/i })
    ).toBeInTheDocument();
  });

  it('does not show the submit button on the first step', () => {
    renderForm();

    expect(
      screen.queryByRole('button', { name: /set up passkey/i })
    ).not.toBeInTheDocument();
  });

  it('shows error for invalid invite code', async () => {
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'INVALID_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Invalid or expired invite code')
      ).toBeInTheDocument();
    });
  });

  it('validates code and advances to user info step', async () => {
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'VALID_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
    expect(screen.getByText('First Name')).toBeInTheDocument();
    expect(screen.getByText('Last Name')).toBeInTheDocument();
    expect(screen.getByText('Username')).toBeInTheDocument();
  });

  it('shows submit button on user info step', async () => {
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'VALID_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /set up passkey/i })
      ).toBeInTheDocument();
    });
  });

  it('auto-populates email from URL query param', async () => {
    const user = userEvent.setup();
    render(<OnboardingForm />, {
      preloadedState: { auth: AUTH_STATES.guest },
      route: '/register?email=invited%40example.com',
    });

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'VALID_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
    });

    const emailInput = screen.getByLabelText('Email');
    expect(emailInput).toHaveValue('invited@example.com');
  });

  it('shows implementer select for Implementer role type', async () => {
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'VALID_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(screen.getByText('Department/Org/Committee')).toBeInTheDocument();
    });
  });

  it('shows multi-select for CPIC role type', async () => {
    const user = userEvent.setup();
    renderForm();

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'CPIC_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Select your assigned implementers')
      ).toBeInTheDocument();
    });
  });

  describe('Implementer registration validation', () => {
    async function advanceAsImplementer(user) {
      const input = screen.getByPlaceholderText(
        'enter your invite code here and verify'
      );
      await user.type(input, 'VALID_CODE');
      await user.click(screen.getByRole('button', { name: /verify code/i }));
      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    }

    it('requires implementer_org_id when registering as Implementer', async () => {
      const user = userEvent.setup();
      renderForm();
      await advanceAsImplementer(user);

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('First Name'), 'Jane');
      await user.type(screen.getByLabelText('Last Name'), 'Doe');

      await user.click(screen.getByRole('button', { name: /set up passkey/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Please select your organization')
        ).toBeInTheDocument();
      });
    });

    it('does not require assigned_implementers when registering as Implementer', async () => {
      const user = userEvent.setup();
      renderForm();
      await advanceAsImplementer(user);

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('First Name'), 'Jane');
      await user.type(screen.getByLabelText('Last Name'), 'Doe');

      await user.click(screen.getByRole('button', { name: /set up passkey/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Please select your organization')
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Please select at least one implementer')
      ).not.toBeInTheDocument();
    });
  });

  describe('CPIC registration validation', () => {
    async function advanceAsCPIC(user) {
      const input = screen.getByPlaceholderText(
        'enter your invite code here and verify'
      );
      await user.type(input, 'CPIC_CODE');
      await user.click(screen.getByRole('button', { name: /verify code/i }));
      await waitFor(() => {
        expect(screen.getByText('Email')).toBeInTheDocument();
      });
    }

    it('requires assigned_implementers when registering as CPIC', async () => {
      const user = userEvent.setup();
      renderForm();
      await advanceAsCPIC(user);

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('First Name'), 'Jane');
      await user.type(screen.getByLabelText('Last Name'), 'Doe');

      await user.click(screen.getByRole('button', { name: /set up passkey/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Please select at least one implementer')
        ).toBeInTheDocument();
      });
    });

    it('does not require implementer_org_id when registering as CPIC', async () => {
      const user = userEvent.setup();
      renderForm();
      await advanceAsCPIC(user);

      await user.type(screen.getByLabelText('Email'), 'test@example.com');
      await user.type(screen.getByLabelText('First Name'), 'Jane');
      await user.type(screen.getByLabelText('Last Name'), 'Doe');

      await user.click(screen.getByRole('button', { name: /set up passkey/i }));

      await waitFor(() => {
        expect(
          screen.getByText('Please select at least one implementer')
        ).toBeInTheDocument();
      });

      expect(
        screen.queryByText('Please select your organization')
      ).not.toBeInTheDocument();
    });
  });

  it('shows loading dots while implementers are loading', async () => {
    server.use(
      http.get(`${API_URL}/implementers`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return HttpResponse.json({
          status: 200,
          message: 'Success',
          data: [
            { id: 1, name: 'Planning Board' },
            { id: 2, name: 'Public Works' },
          ],
        });
      })
    );

    const user = userEvent.setup();
    renderForm();

    const input = screen.getByPlaceholderText(
      'enter your invite code here and verify'
    );
    await user.type(input, 'VALID_CODE');
    await user.click(screen.getByRole('button', { name: /verify code/i }));

    await waitFor(() => {
      expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Email')).toBeInTheDocument();
    });
  });
});
