import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ManagePolicies } from '../ManagePolicies';
import { AUTH_STATES } from '../../../test/test-utils.jsx';

const mockUseMediaQuery = vi.fn().mockReturnValue(false);
vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: (...args) => mockUseMediaQuery(...args),
}));

describe('ManagePolicies', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('as Admin', () => {
    const renderAsAdmin = () =>
      render(<ManagePolicies />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });

    it('renders page title', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(screen.getByText('Manage Policies')).toBeInTheDocument();
      });
    });

    it('shows "Create Policy" button', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create policy/i })
        ).toBeInTheDocument();
      });
    });

    it('renders policy data after loading', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(screen.getByText('Policy A')).toBeInTheDocument();
      });
      expect(screen.getByText('Policy B')).toBeInTheDocument();
    });

    it('opens create form when Create button is clicked', async () => {
      renderAsAdmin();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create policy/i })
        ).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /create policy/i }));

      await waitFor(() => {
        expect(screen.getByText('Add a new policy')).toBeInTheDocument();
      });
    });
  });

  describe('as CPIC Admin', () => {
    it('shows "Create Policy" button (CPIC Admin can edit)', async () => {
      render(<ManagePolicies />, {
        preloadedState: { auth: AUTH_STATES.cpicAdmin },
      });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create policy/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('as Implementer', () => {
    it('hides "Create Policy" button', async () => {
      render(<ManagePolicies />, {
        preloadedState: { auth: AUTH_STATES.implementer },
      });
      await waitFor(() => {
        expect(screen.getByText('Policy A')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /create policy/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('mobile view', () => {
    it('renders cards on mobile', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      render(<ManagePolicies />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });
      await waitFor(() => {
        expect(screen.getByText('Policy A')).toBeInTheDocument();
      });
      // Cards render policy numbers in badges
      expect(screen.getByText('#1')).toBeInTheDocument();
      expect(screen.getByText('#2')).toBeInTheDocument();
    });
  });
});
