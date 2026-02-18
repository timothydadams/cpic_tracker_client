import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '../../../test/test-utils.jsx';
import userEvent from '@testing-library/user-event';
import { FocusAreaTab } from '../FocusAreaTab';

describe('FocusAreaTab', () => {
  it('renders the completion bar chart title', async () => {
    render(<FocusAreaTab />);

    await waitFor(() => {
      expect(screen.getByText('Completion by Focus Area')).toBeInTheDocument();
    });
  });

  it('renders focus area progress tree with collapsible sections', async () => {
    render(<FocusAreaTab />);

    await waitFor(() => {
      expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
    });

    expect(screen.getByText(/20 strategies/)).toBeInTheDocument();
    expect(screen.getByText(/40% complete/)).toBeInTheDocument();
  });

  it('expands focus area to show policies when clicked', async () => {
    const user = userEvent.setup();
    render(<FocusAreaTab />);

    await waitFor(() => {
      expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
    });

    // Click on the focus area to expand it
    await user.click(screen.getByText('Housing & Neighborhoods'));

    await waitFor(() => {
      expect(screen.getByText(/Policy 1: Policy A/)).toBeInTheDocument();
    });

    expect(screen.getByText(/Policy 2: Policy B/)).toBeInTheDocument();
  });

  it('shows overdue badge on policies with overdue strategies', async () => {
    const user = userEvent.setup();
    render(<FocusAreaTab />);

    await waitFor(() => {
      expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Housing & Neighborhoods'));

    await waitFor(() => {
      expect(screen.getByText('1 overdue')).toBeInTheDocument();
    });
  });

  it('shows policy completion counts', async () => {
    const user = userEvent.setup();
    render(<FocusAreaTab />);

    await waitFor(() => {
      expect(screen.getByText('Housing & Neighborhoods')).toBeInTheDocument();
    });

    await user.click(screen.getByText('Housing & Neighborhoods'));

    await waitFor(() => {
      expect(screen.getByText('3/6')).toBeInTheDocument();
      expect(screen.getByText('1/4')).toBeInTheDocument();
    });
  });
});
