import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import { Route, Routes } from 'react-router-dom';
import { MetricsPage } from '../MetricsPage';
import { OverviewTab } from '../OverviewTab';
import { FocusAreaTab } from '../FocusAreaTab';
import { TimelineTab } from '../TimelineTab';
import { ImplementerTab } from '../ImplementerTab';

const renderWithRoutes = (route = '/metrics/overview') =>
  render(
    <Routes>
      <Route path='metrics' element={<MetricsPage />}>
        <Route path='overview' element={<OverviewTab />} />
        <Route path='focus-areas' element={<FocusAreaTab />} />
        <Route path='timelines' element={<TimelineTab />} />
        <Route path='implementers' element={<ImplementerTab />} />
      </Route>
    </Routes>,
    { route }
  );

describe('MetricsPage', () => {
  it('renders page heading', () => {
    renderWithRoutes();
    expect(screen.getByText('Plan Metrics')).toBeInTheDocument();
  });

  it('renders overview content at /metrics/overview', async () => {
    renderWithRoutes('/metrics/overview');

    await waitFor(() => {
      expect(screen.getByText('Total Strategies')).toBeInTheDocument();
    });
  });

  it('renders focus areas content at /metrics/focus-areas', async () => {
    renderWithRoutes('/metrics/focus-areas');

    await waitFor(() => {
      expect(screen.getByText('Completion by Focus Area')).toBeInTheDocument();
    });
  });

  it('renders timelines content at /metrics/timelines', async () => {
    renderWithRoutes('/metrics/timelines');

    await waitFor(() => {
      expect(screen.getByText('Deadline Drift')).toBeInTheDocument();
    });
  });

  it('renders implementers content at /metrics/implementers', async () => {
    renderWithRoutes('/metrics/implementers');

    await waitFor(() => {
      expect(screen.getByText('Implementer Scorecard')).toBeInTheDocument();
    });
  });
});
