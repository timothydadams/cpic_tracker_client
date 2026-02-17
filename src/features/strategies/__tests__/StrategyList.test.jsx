import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { FullStrategyList } from '../StrategyList';
import { AUTH_STATES } from '../../../test/test-utils.jsx';

vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: () => false,
}));

describe('FullStrategyList', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Create Strategy button', () => {
    it('shows button for Admin', async () => {
      render(<FullStrategyList />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create strategy/i })
        ).toBeInTheDocument();
      });
    });

    it('shows button for CPIC Admin', async () => {
      render(<FullStrategyList />, {
        preloadedState: { auth: AUTH_STATES.cpicAdmin },
      });
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create strategy/i })
        ).toBeInTheDocument();
      });
    });

    it('hides button for Implementer', async () => {
      render(<FullStrategyList />, {
        preloadedState: { auth: AUTH_STATES.implementer },
      });
      await waitFor(() => {
        expect(screen.getByText('Explore All Strategies')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /create strategy/i })
      ).not.toBeInTheDocument();
    });

    it('hides button for Viewer', async () => {
      render(<FullStrategyList />, {
        preloadedState: { auth: AUTH_STATES.viewer },
      });
      await waitFor(() => {
        expect(screen.getByText('Explore All Strategies')).toBeInTheDocument();
      });
      expect(
        screen.queryByRole('button', { name: /create strategy/i })
      ).not.toBeInTheDocument();
    });

    it('opens modal when clicked', async () => {
      render(<FullStrategyList />, {
        preloadedState: { auth: AUTH_STATES.admin },
      });
      const user = userEvent.setup();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /create strategy/i })
        ).toBeInTheDocument();
      });

      await user.click(
        screen.getByRole('button', { name: /create strategy/i })
      );

      await waitFor(() => {
        expect(
          screen.getByText('Add a new strategy to the comprehensive plan')
        ).toBeInTheDocument();
      });
    });
  });
});
