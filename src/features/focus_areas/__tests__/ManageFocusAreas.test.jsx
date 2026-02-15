import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ManageFocusAreas } from '../ManageFocusAreas';
import { AUTH_STATES } from '../../../test/test-utils.jsx';

const mockUseMediaQuery = vi.fn().mockReturnValue(false);
vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: (...args) => mockUseMediaQuery(...args),
}));

describe('ManageFocusAreas', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('as Admin', () => {
    const renderAsAdmin = () =>
      render(<ManageFocusAreas />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });

    it('shows "Create Focus Area" button', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create focus area/i })
        ).toBeInTheDocument();
      });
    });

    it('renders page title', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(screen.getByText('Manage Focus Areas')).toBeInTheDocument();
      });
    });

    it('renders data after loading', async () => {
      renderAsAdmin();
      await waitFor(() => {
        expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
      });
      expect(screen.getByText('Economic Development')).toBeInTheDocument();
    });

    it('opens create form when Create button is clicked', async () => {
      renderAsAdmin();
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create focus area/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /create focus area/i })
      );

      await waitFor(() => {
        expect(screen.getByText('Add a new focus area')).toBeInTheDocument();
      });
    });
  });

  describe('as CPIC Admin', () => {
    it('hides "Create Focus Area" button', async () => {
      render(<ManageFocusAreas />, {
        preloadedState: { auth: AUTH_STATES.cpicAdmin },
      });
      await waitFor(() => {
        expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /create focus area/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('as Implementer', () => {
    it('hides "Create Focus Area" button', async () => {
      render(<ManageFocusAreas />, {
        preloadedState: { auth: AUTH_STATES.implementer },
      });
      await waitFor(() => {
        expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /create focus area/i })
      ).not.toBeInTheDocument();
    });
  });

  describe('mobile view', () => {
    it('renders cards on mobile', async () => {
      mockUseMediaQuery.mockReturnValue(true);
      render(<ManageFocusAreas />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });
      await waitFor(() => {
        expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
      });
      // Cards render policy count badges
      expect(screen.getByText('2 policies')).toBeInTheDocument();
      expect(screen.getByText('0 policies')).toBeInTheDocument();
    });
  });
});
