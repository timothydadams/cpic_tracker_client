import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import { AUTH_STATES } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ScorecardConfigSection } from '../ScorecardConfigSection';

describe('ScorecardConfigSection', () => {
  const renderSection = () =>
    render(<ScorecardConfigSection />, {
      preloadedState: { auth: AUTH_STATES.admin },
    });

  it('renders the section title and description after loading', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scorecard Configuration')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Adjust the scoring weights and grade thresholds/)
    ).toBeInTheDocument();
  });

  it('renders scoring weights fieldset with labels', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scoring Weights')).toBeInTheDocument();
    });

    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('On-Time Rate')).toBeInTheDocument();
    expect(screen.getByText('Overdue Penalty')).toBeInTheDocument();
  });

  it('renders grade thresholds fieldset with labels', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Grade Thresholds')).toBeInTheDocument();
    });

    expect(screen.getByText('A Minimum')).toBeInTheDocument();
    expect(screen.getByText('B Minimum')).toBeInTheDocument();
    expect(screen.getByText('C Minimum')).toBeInTheDocument();
    expect(screen.getByText('D Minimum')).toBeInTheDocument();
  });

  it('populates form fields with config values from API', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scoring Weights')).toBeInTheDocument();
    });

    // Weight fields: 0.4, 0.35, 0.25
    const numberInputs = screen.getAllByRole('spinbutton');
    expect(numberInputs[0]).toHaveValue(0.4);
    expect(numberInputs[1]).toHaveValue(0.35);
    expect(numberInputs[2]).toHaveValue(0.25);

    // Grade fields: 90, 80, 70, 60
    expect(numberInputs[3]).toHaveValue(90);
    expect(numberInputs[4]).toHaveValue(80);
    expect(numberInputs[5]).toHaveValue(70);
    expect(numberInputs[6]).toHaveValue(60);
  });

  it('shows valid weight sum indicator when weights sum to 1.0', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Sum: 1.00')).toBeInTheDocument();
    });
  });

  it('shows invalid weight sum indicator when weights do not sum to 1.0', async () => {
    const user = userEvent.setup();
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scoring Weights')).toBeInTheDocument();
    });

    const numberInputs = screen.getAllByRole('spinbutton');
    // Change completion rate from 0.4 to 0.5 (sum becomes 1.1)
    await user.clear(numberInputs[0]);
    await user.type(numberInputs[0], '0.5');

    await waitFor(() => {
      expect(screen.getByText(/must equal 1\.00/)).toBeInTheDocument();
    });
  });

  it('shows valid grade order indicator when thresholds are descending', async () => {
    renderSection();

    await waitFor(() => {
      expect(
        screen.getByText(/A\(90\) > B\(80\) > C\(70\) > D\(60\)/)
      ).toBeInTheDocument();
    });
  });

  it('shows invalid grade order indicator when thresholds are not descending', async () => {
    const user = userEvent.setup();
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Grade Thresholds')).toBeInTheDocument();
    });

    const numberInputs = screen.getAllByRole('spinbutton');
    // Set grade B to 95 (higher than A=90, breaking descending order)
    await user.clear(numberInputs[4]);
    await user.type(numberInputs[4], '95');

    await waitFor(() => {
      expect(
        screen.getByText(/Thresholds must be strictly descending/)
      ).toBeInTheDocument();
    });
  });

  it('disables Save button when form is pristine', async () => {
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: 'Save Changes' })).toBeDisabled();
  });

  it('enables Save button when form is dirty and valid', async () => {
    const user = userEvent.setup();
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scoring Weights')).toBeInTheDocument();
    });

    const numberInputs = screen.getAllByRole('spinbutton');
    // Change completion rate from 0.4 to 0.45 and on-time from 0.35 to 0.30
    // so weights still sum to 1.0
    await user.clear(numberInputs[0]);
    await user.type(numberInputs[0], '0.45');
    await user.clear(numberInputs[1]);
    await user.type(numberInputs[1], '0.3');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeEnabled();
    });
  });

  it('disables Save button when weights do not sum to 1.0', async () => {
    const user = userEvent.setup();
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scoring Weights')).toBeInTheDocument();
    });

    const numberInputs = screen.getAllByRole('spinbutton');
    // Change completion rate to 0.9 (sum becomes 1.5)
    await user.clear(numberInputs[0]);
    await user.type(numberInputs[0], '0.9');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeDisabled();
    });
  });

  it('submits only changed fields and shows success snackbar', async () => {
    const user = userEvent.setup();
    renderSection();

    await waitFor(() => {
      expect(screen.getByText('Scoring Weights')).toBeInTheDocument();
    });

    const numberInputs = screen.getAllByRole('spinbutton');
    // Adjust weights: 0.45 + 0.30 + 0.25 = 1.0
    await user.clear(numberInputs[0]);
    await user.type(numberInputs[0], '0.45');
    await user.clear(numberInputs[1]);
    await user.type(numberInputs[1], '0.3');

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: 'Save Changes' })
      ).toBeEnabled();
    });

    await user.click(screen.getByRole('button', { name: 'Save Changes' }));

    await waitFor(() => {
      expect(
        screen.getByText('Scorecard configuration updated')
      ).toBeInTheDocument();
    });
  });
});
