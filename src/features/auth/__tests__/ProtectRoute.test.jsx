import { describe, it, expect } from 'vitest';
import { render, screen } from '../../../test/test-utils.jsx';
import { Routes, Route } from 'react-router-dom';
import { ProtectRoute } from '../ProtectRoute';
import { AUTH_STATES } from '../../../test/test-utils.jsx';

const ProtectedContent = () => <div>Protected Content</div>;
const LoginPage = () => <div>Login Page</div>;
const UnauthorizedPage = () => <div>Unauthorized</div>;

const renderRoute = (preloadedState, route = '/protected') =>
  render(
    <Routes>
      <Route element={<ProtectRoute allowedRoles={['Admin', 'CPIC Admin']} />}>
        <Route path='/protected' element={<ProtectedContent />} />
      </Route>
      <Route path='/login' element={<LoginPage />} />
      <Route path='/unauthorized' element={<UnauthorizedPage />} />
    </Routes>,
    { preloadedState, route }
  );

describe('ProtectRoute', () => {
  it('allows Admin users to access protected routes', () => {
    renderRoute({ auth: AUTH_STATES.admin });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('allows CPIC Admin users to access protected routes', () => {
    renderRoute({ auth: AUTH_STATES.cpicAdmin });
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects Implementer users to /unauthorized', () => {
    renderRoute({ auth: AUTH_STATES.implementer });
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login', () => {
    renderRoute({ auth: AUTH_STATES.guest });
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });

  it('redirects Viewer users to /unauthorized', () => {
    renderRoute({ auth: AUTH_STATES.viewer });
    expect(screen.getByText('Unauthorized')).toBeInTheDocument();
  });

  it('allows any authenticated user when allowedRoles is empty', () => {
    const { container } = render(
      <Routes>
        <Route element={<ProtectRoute allowedRoles={[]} />}>
          <Route path='/my-page' element={<ProtectedContent />} />
        </Route>
        <Route path='/login' element={<LoginPage />} />
      </Routes>,
      { preloadedState: { auth: AUTH_STATES.implementer }, route: '/my-page' }
    );
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /login even with empty allowedRoles', () => {
    render(
      <Routes>
        <Route element={<ProtectRoute allowedRoles={[]} />}>
          <Route path='/my-page' element={<ProtectedContent />} />
        </Route>
        <Route path='/login' element={<LoginPage />} />
      </Routes>,
      { preloadedState: { auth: AUTH_STATES.guest }, route: '/my-page' }
    );
    expect(screen.getByText('Login Page')).toBeInTheDocument();
  });
});
