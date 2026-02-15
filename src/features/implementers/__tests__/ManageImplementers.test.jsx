import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ManageImplementers } from '../ManageImplementers';
import { AUTH_STATES } from '../../../test/test-utils.jsx';

const mockUseMediaQuery = vi.fn().mockReturnValue(false);
vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: (...args) => mockUseMediaQuery(...args),
}));

describe('ManageImplementers', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('as Admin', () => {
    const renderAsAdmin = () =>
      render(<ManageImplementers />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });

    it('renders page title', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(screen.getByText('Manage Implementers')).toBeInTheDocument();
      });
    });

    it('shows "Create Implementer" button', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create implementer/i })
        ).toBeInTheDocument();
      });
    });

    it('renders implementer data after loading', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(screen.getByText('Planning Board')).toBeInTheDocument();
      });
      expect(screen.getByText('Public Works')).toBeInTheDocument();
    });

    it('opens create form when Create button is clicked', async () => {
      renderAsAdmin();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create implementer/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /create implementer/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText('Add a new implementer organization')
        ).toBeInTheDocument();
      });
    });
  });

  describe('as CPIC Admin', () => {
    it('shows "Create Implementer" button (CPIC Admin can edit)', async () => {
      render(<ManageImplementers />, {
        preloadedState: { auth: AUTH_STATES.cpicAdmin },
      });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create implementer/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('as Implementer', () => {
    it('hides "Create Implementer" button', async () => {
      render(<ManageImplementers />, {
        preloadedState: { auth: AUTH_STATES.implementer },
      });
      await waitFor(() => {
        expect(screen.getByText('Planning Board')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /create implementer/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('mobile view', () => {
    it('renders cards on mobile', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      render(<ManageImplementers />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });
      await waitFor(() => {
        expect(screen.getByText('Planning Board')).toBeInTheDocument();
      });
      // Cards render type badges
      expect(screen.getByText('Board')).toBeInTheDocument();
    });
  });
});
