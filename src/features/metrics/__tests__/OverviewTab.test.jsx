import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import { OverviewTab } from '../OverviewTab';

describe('OverviewTab', () => {
  it('renders KPI cards after data loads', async () => {
    render(<OverviewTab />);

    await waitFor(() => {
      expect(screen.getByText('Total Strategies')).toBeInTheDocument();
    });

    expect(screen.getByText('Completion Rate')).toBeInTheDocument();
    expect(screen.getByText('On-Time Rate')).toBeInTheDocument();
    expect(screen.getByText('Overdue')).toBeInTheDocument();
    expect(screen.getByText('Avg Days to Complete')).toBeInTheDocument();
  });

  it('displays correct plan overview values', async () => {
    render(<OverviewTab />);

    await waitFor(() => {
      expect(screen.getByText('85')).toBeInTheDocument();
    });

    expect(screen.getByText('25.9%')).toBeInTheDocument();
    expect(screen.getByText('81.8%')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('142.5')).toBeInTheDocument();
  });

  it('displays subtexts for KPI cards', async () => {
    render(<OverviewTab />);

    await waitFor(() => {
      expect(
        screen.getByText('22 completed, 40 in progress')
      ).toBeInTheDocument();
    });

    expect(screen.getByText('22 of 85 strategies')).toBeInTheDocument();
    expect(screen.getByText('18 on-time, 4 late')).toBeInTheDocument();
  });

  it('highlights overdue count when greater than zero', async () => {
    render(<OverviewTab />);

    await waitFor(() => {
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    const overdueValue = screen.getByText('7');
    expect(overdueValue.className).toContain('text-red');
  });

  it('renders skeleton cards while loading', () => {
    render(<OverviewTab />);
    // Before data loads, skeletons are rendered (divs with animate-pulse class)
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders strategy breakdown charts', async () => {
    render(<OverviewTab />);

    await waitFor(() => {
      expect(screen.getByText('Strategies By Status')).toBeInTheDocument();
    });

    expect(screen.getByText('Strategies By Timeline')).toBeInTheDocument();
  });
});
