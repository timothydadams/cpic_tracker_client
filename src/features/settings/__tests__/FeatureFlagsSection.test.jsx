import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import { AUTH_STATES } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { FeatureFlagsSection } from '../FeatureFlagsSection';

describe('FeatureFlagsSection', () => {
  const renderSection = () =>
    render(<FeatureFlagsSection />, {
      preloadedState: { auth: AUTH_STATES.admin },
    });

  it('renders the section title and description', async () => {
    renderSection();

    await waitFor(() => {
      expect(
        screen.getByText('Notification Feature Flags')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Control which automated email notifications are active/)
    ).toBeInTheDocument();
  });

  it('renders all three feature flag switches after loading', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Deadline Scheduler')).toBeInTheDocument();
    });

    expect(screen.getByText('Deadline Reminders')).toBeInTheDocument();
    expect(screen.getByText('Overdue Notifications')).toBeInTheDocument();
  });

  it('renders flag descriptions', async () => {
    renderSection();

    await waitFor(() => {
      expect(
        screen.getByText('Master switch for the daily deadline check cron job')
      ).toBeInTheDocument();
    });

    expect(
      screen.getByText('Upcoming deadline and day-of reminder emails')
    ).toBeInTheDocument();
    expect(
      screen.getByText('Overdue strategy notification emails')
    ).toBeInTheDocument();
  });

  it('renders switches with correct initial checked state', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Deadline Scheduler')).toBeInTheDocument();
    });

    // HeadlessUI Switch uses role="switch" with aria-checked
    const switches = screen.getAllByRole('switch');
    expect(switches).toHaveLength(3);

    // deadline_scheduler: enabled=true, deadline_reminders: enabled=true, overdue_notifications: enabled=false
    expect(switches[0]).toHaveAttribute('aria-checked', 'true');
    expect(switches[1]).toHaveAttribute('aria-checked', 'true');
    expect(switches[2]).toHaveAttribute('aria-checked', 'false');
  });

  it('toggles a feature flag and shows success snackbar', async () => {
    const user = userEvent.setup();
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Overdue Notifications')).toBeInTheDocument();
    });

    const switches = screen.getAllByRole('switch');
    // Toggle overdue_notifications (currently disabled)
    await user.click(switches[2]);

    await waitFor(() => {
      expect(
        screen.getByText('Overdue Notifications enabled')
      ).toBeInTheDocument();
    });
  });
});
