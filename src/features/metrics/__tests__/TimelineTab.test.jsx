import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import { TimelineTab } from '../TimelineTab';

describe('TimelineTab', () => {
  it('renders timeline tier cards', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getAllByText('Short-Term').length).toBeGreaterThan(0);
    });

    expect(screen.getAllByText('Mid-Term').length).toBeGreaterThan(0);
  });

  it('displays completion rates for each tier', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    expect(screen.getByText('20%')).toBeInTheDocument();
  });

  it('displays completion counts', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('15 of 30 completed')).toBeInTheDocument();
    });

    expect(screen.getByText('5 of 25 completed')).toBeInTheDocument();
  });

  it('shows days remaining badges', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('195 days remaining')).toBeInTheDocument();
    });

    expect(screen.getByText('1656 days remaining')).toBeInTheDocument();
  });

  it('shows overdue badges for tiers with overdue strategies', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('3 overdue')).toBeInTheDocument();
    });
  });

  it('renders deadline drift card', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('Deadline Drift')).toBeInTheDocument();
    });
  });

  it('displays drift statistics', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('17.1%')).toBeInTheDocument();
    });

    expect(screen.getByText('87.3')).toBeInTheDocument();
  });

  it('renders overdue strategies table', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(screen.getByText('Overdue Strategies')).toBeInTheDocument();
    });
  });

  it('displays overdue strategy data in table', async () => {
    render(<TimelineTab />);

    await waitFor(() => {
      expect(
        screen.getByText(/Develop teacher recruitment pipeline/)
      ).toBeInTheDocument();
    });

    expect(screen.getByText('33d')).toBeInTheDocument();
    expect(screen.getByText('Planning Board')).toBeInTheDocument();
  });
});
