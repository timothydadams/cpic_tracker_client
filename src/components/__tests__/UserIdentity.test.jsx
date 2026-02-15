import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/test-utils.jsx';
import { UserIdentity } from '../UserIdentity';

describe('UserIdentity', () => {
  const authenticatedUser = {
    given_name: 'Jane',
    family_name: 'Doe',
    display_name: 'Jane Doe',
    username: 'janedoe',
    id: 'abc-123-def',
    email: 'jane@test.com',
    profile_pic: 'https://example.com/pic.jpg',
  };

  describe('avatar', () => {
    it('renders avatar with profile_pic when provided', () => {
      const { container } = render(
        <UserIdentity user={authenticatedUser} isAuthenticated={true} />
      );
      // Radix Avatar only renders <img> after onload fires (not possible in jsdom).
      // Verify the avatar container renders and the fallback initial is present.
      const avatar = container.querySelector('[class*="rounded-full"]');
      expect(avatar).toBeInTheDocument();
      // Fallback shows because jsdom can't load images
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders fallback initial from given_name when profile_pic is missing', () => {
      const user = { ...authenticatedUser, profile_pic: null };
      render(<UserIdentity user={user} isAuthenticated={true} />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders fallback initial from username when given_name is missing', () => {
      const user = { username: 'bob', id: '123' };
      render(<UserIdentity user={user} isAuthenticated={false} />);
      expect(screen.getByText('B')).toBeInTheDocument();
    });
  });

  describe('display name - unauthenticated', () => {
    it('shows username as display name', () => {
      const user = { username: 'guestuser', id: '123-456' };
      render(<UserIdentity user={user} isAuthenticated={false} />);
      expect(screen.getByText('guestuser')).toBeInTheDocument();
    });

    it('falls back to truncated id when username is missing', () => {
      const user = { id: 'abc-123-def' };
      render(<UserIdentity user={user} isAuthenticated={false} />);
      expect(screen.getByText('abc')).toBeInTheDocument();
    });

    it('shows "Unknown" when all fields are missing', () => {
      render(<UserIdentity user={{}} isAuthenticated={false} />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  describe('display name - authenticated', () => {
    it('shows "first last" as display name', () => {
      render(<UserIdentity user={authenticatedUser} isAuthenticated={true} />);
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('shows just given_name when family_name is missing', () => {
      const user = { given_name: 'Jane', display_name: 'Jane D' };
      render(<UserIdentity user={user} isAuthenticated={true} />);
      expect(screen.getByText('Jane')).toBeInTheDocument();
    });

    it('falls back to display_name when given_name/family_name are missing', () => {
      const user = { display_name: 'Custom Name', username: 'custom' };
      render(<UserIdentity user={user} isAuthenticated={true} />);
      expect(screen.getByText('Custom Name')).toBeInTheDocument();
    });

    it('falls back to username when all name fields are missing', () => {
      const user = { username: 'fallback' };
      render(<UserIdentity user={user} isAuthenticated={true} />);
      expect(screen.getByText('fallback')).toBeInTheDocument();
    });
  });

  describe('timestamp', () => {
    it('renders timestamp when provided', () => {
      render(
        <UserIdentity
          user={authenticatedUser}
          isAuthenticated={true}
          timestamp='2024-06-15T12:00:00Z'
        />
      );
      expect(
        screen.getByTagName?.('time') ||
          screen.getByText(/6\/15\/2024|15\/06\/2024|2024/)
      ).toBeInTheDocument();
    });

    it('does not render timestamp element when not provided', () => {
      const { container } = render(
        <UserIdentity user={authenticatedUser} isAuthenticated={true} />
      );
      expect(container.querySelector('time')).not.toBeInTheDocument();
    });
  });

  describe('tooltip', () => {
    it('renders tooltip trigger for authenticated users', () => {
      render(<UserIdentity user={authenticatedUser} isAuthenticated={true} />);
      // The display name should be wrapped in a tooltip trigger (a span with cursor-default)
      const nameSpan = screen.getByText('Jane Doe');
      expect(nameSpan).toHaveClass('cursor-default');
    });

    it('does not render tooltip trigger for unauthenticated users', () => {
      const user = { username: 'guest' };
      render(<UserIdentity user={user} isAuthenticated={false} />);
      const nameSpan = screen.getByText('guest');
      expect(nameSpan).not.toHaveClass('cursor-default');
    });
  });
});
