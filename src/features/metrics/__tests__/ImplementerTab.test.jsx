import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { ImplementerTab } from '../ImplementerTab';

describe('ImplementerTab', () => {
  it('renders the scorecard table title', async () => {
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('Implementer Scorecard')).toBeInTheDocument();
    });
  });

  it('renders completion trend chart title', async () => {
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('Completion Trend')).toBeInTheDocument();
    });
  });

  it('displays implementer scorecard data', async () => {
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('Planning Board')).toBeInTheDocument();
    });

    expect(screen.getByText('Public Works')).toBeInTheDocument();
  });

  it('displays grades for implementers', async () => {
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('displays scores for implementers', async () => {
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('62.5')).toBeInTheDocument();
    });

    expect(screen.getByText('92.5')).toBeInTheDocument();
  });

  it('expands scorecard detail when implementer row is clicked', async () => {
    const user = userEvent.setup();
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('Planning Board')).toBeInTheDocument();
    });

    // Click on the Planning Board row in the scorecard table
    await user.click(screen.getByText('Planning Board'));

    await waitFor(() => {
      // The detail panel should show the implementer's detailed breakdown
      expect(screen.getByText('By Timeline')).toBeInTheDocument();
    });

    expect(screen.getByText('By Focus Area')).toBeInTheDocument();
    expect(screen.getByText('Recent Completions')).toBeInTheDocument();
    expect(screen.getByText('Overdue Strategies')).toBeInTheDocument();
  });

  it('shows scorecard detail with correct data', async () => {
    const user = userEvent.setup();
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('Planning Board')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Planning Board'));

    await waitFor(() => {
      expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
    });

    expect(
      screen.getByText(/Complete housing inventory assessment/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Develop teacher recruitment pipeline/)
    ).toBeInTheDocument();
  });

  it('collapses scorecard detail when same row is clicked again', async () => {
    const user = userEvent.setup();
    render(<ImplementerTab />);

    await waitFor(() => {
      expect(screen.getByText('Planning Board')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Planning Board'));

    await waitFor(() => {
      expect(screen.getByText('By Timeline')).toBeInTheDocument();
    });

    // Close the modal via the close button
    await user.click(screen.getByRole('button', { name: /close/i }));

    await waitFor(() => {
      expect(screen.queryByText('By Timeline')).not.toBeInTheDocument();
    });
  });

  it('renders filter controls', () => {
    render(<ImplementerTab />);

    expect(screen.getByText('All Strategies')).toBeInTheDocument();
    expect(screen.getByText('Monthly')).toBeInTheDocument();
  });
});
