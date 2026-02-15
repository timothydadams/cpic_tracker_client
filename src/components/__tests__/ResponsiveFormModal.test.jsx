import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '../../test/test-utils.jsx';
import { ResponsiveFormModal } from '../ResponsiveFormModal';

// Mock useMediaQuery to control mobile/desktop rendering
const mockUseMediaQuery = vi.fn();
vi.mock('@uidotdev/usehooks', () => ({
  useMediaQuery: (...args) => mockUseMediaQuery(...args),
}));

describe('ResponsiveFormModal', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    title: 'Test Modal',
    description: 'Test description',
    children: <div>Form content</div>,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('desktop (>768px)', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(false);
    });

    it('renders Dialog with title and description', () => {
      render(<ResponsiveFormModal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<ResponsiveFormModal {...defaultProps} />);
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('renders with role="dialog"', () => {
      render(<ResponsiveFormModal {...defaultProps} />);
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<ResponsiveFormModal {...defaultProps} open={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('omits description when not provided', () => {
      render(<ResponsiveFormModal {...defaultProps} description={undefined} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.queryByText('Test description')).not.toBeInTheDocument();
    });
  });

  describe('mobile (<=768px)', () => {
    beforeEach(() => {
      mockUseMediaQuery.mockReturnValue(true);
    });

    it('renders Sheet with title and description', () => {
      render(<ResponsiveFormModal {...defaultProps} />);
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('renders children content', () => {
      render(<ResponsiveFormModal {...defaultProps} />);
      expect(screen.getByText('Form content')).toBeInTheDocument();
    });

    it('does not render when open is false', () => {
      render(<ResponsiveFormModal {...defaultProps} open={false} />);
      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });
  });
});
