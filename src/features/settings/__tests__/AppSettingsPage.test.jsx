import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import { AUTH_STATES } from '../../../test/test-utils.jsx';
import { AppSettingsPage } from '../AppSettingsPage';

describe('AppSettingsPage', () => {
  it('renders page heading and description', () => {
    render(<AppSettingsPage />, {
      preloadedState: { auth: AUTH_STATES.admin },
    });

    expect(screen.getByText('App Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Configure application-wide settings and preferences.')
    ).toBeInTheDocument();
  });

  it('renders both sections for Admin users', async () => {
    render(<AppSettingsPage />, {
      preloadedState: { auth: AUTH_STATES.admin },
    });

    await waitFor(() => {
      expect(screen.getByText('Scorecard Configuration')).toBeInTheDocument();
    });

    expect(screen.getByText('Notification Feature Flags')).toBeInTheDocument();
  });

  it('renders only scorecard section for CPIC Admin users', async () => {
    render(<AppSettingsPage />, {
      preloadedState: { auth: AUTH_STATES.cpicAdmin },
    });

    await waitFor(() => {
      expect(screen.getByText('Scorecard Configuration')).toBeInTheDocument();
    });

    expect(
      screen.queryByText('Notification Feature Flags')
    ).not.toBeInTheDocument();
  });

  it('renders neither section for non-admin users', () => {
    render(<AppSettingsPage />, {
      preloadedState: { auth: AUTH_STATES.implementer },
    });

    expect(
      screen.queryByText('Scorecard Configuration')
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText('Notification Feature Flags')
    ).not.toBeInTheDocument();
  });
});
