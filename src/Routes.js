import React, { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { PersistAuth } from './features/auth/PersistAuth.js';
import { ProtectRoute } from './features/auth/ProtectRoute';
import { AnonymousOnly } from './features/auth/AnonymousOnly';
import { Layout } from 'components/layout/Layout';
import { Text } from 'catalyst/text';

// Eagerly loaded: shell components that are always needed
import { NotFound, NotAuthorized } from 'components/Generic';

// Lazy-loaded route components
const LoginForm = lazy(() =>
  import('./features/auth/LoginForm.jsx').then((m) => ({
    default: m.LoginForm,
  }))
);
const OnboardingForm = lazy(() =>
  import('./features/auth/onboarding/OnboardNewUser.js').then((m) => ({
    default: m.OnboardingForm,
  }))
);
const ProfileContainer = lazy(() =>
  import('./features/users/Profile').then((m) => ({
    default: m.ProfileContainer,
  }))
);
const UserManager = lazy(() =>
  import('./features/users/UserManager.js').then((m) => ({
    default: m.UserManager,
  }))
);
const ManageFocusAreas = lazy(() =>
  import('./features/focus_areas/ManageFocusAreas.js').then((m) => ({
    default: m.ManageFocusAreas,
  }))
);
const ManagePolicies = lazy(() =>
  import('./features/policies/ManagePolicies.js').then((m) => ({
    default: m.ManagePolicies,
  }))
);
const ManageImplementers = lazy(() =>
  import('./features/implementers/ManageImplementers.js').then((m) => ({
    default: m.ManageImplementers,
  }))
);
const Dashboard = lazy(() =>
  import('./Pages/Dashboard.js').then((m) => ({ default: m.Dashboard }))
);
const FullStrategyList = lazy(() =>
  import('./features/strategies/StrategyList.js').then((m) => ({
    default: m.FullStrategyList,
  }))
);
const AssignedStrategies = lazy(() =>
  import('./features/strategies/AssignedStrategies.js').then((m) => ({
    default: m.AssignedStrategies,
  }))
);
const FocusAreaList = lazy(() =>
  import('./features/focus_areas/FocusAreaList.js').then((m) => ({
    default: m.FocusAreaList,
  }))
);
const ViewStrategy = lazy(() =>
  import('./features/strategies/ViewStrategy.js').then((m) => ({
    default: m.ViewStrategy,
  }))
);
const StrategyForm = lazy(() =>
  import('./features/strategies/EditStrategyForm.js').then((m) => ({
    default: m.StrategyForm,
  }))
);
const FAQ = lazy(() =>
  import('./features/faq/faq.js').then((m) => ({ default: m.FAQ }))
);

// Lazy-loaded markdown page and its dependencies
const MarkdownPage = lazy(() =>
  Promise.all([
    import('components/layout/MarkdownWrapper.js'),
    import('react-markdown'),
  ]).then(([{ MarkdownWrapper }, { default: Markdown }]) => ({
    default: ({ contents }) => (
      <MarkdownWrapper>
        <Markdown>{contents}</Markdown>
      </MarkdownWrapper>
    ),
  }))
);

const LazyMarkdownPage = ({ importContent }) => {
  const [contents, setContents] = React.useState(null);
  React.useEffect(() => {
    importContent().then((m) => setContents(m.default));
  }, [importContent]);
  if (!contents) return null;
  return <MarkdownPage contents={contents} />;
};

const importTos = () => import('components/layout/TOS.md');
const importPrivacy = () => import('components/layout/PrivacyNotice.md');

/*
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-50'>
    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900 dark:border-zinc-100' />
  </div>
);
*/
const PageLoader = (props) => (
  <div className='flex items-center justify-center min-h-50'>
    <div
      className='inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white'
      role='status'
    >
      <span className='absolute! -m-px! h-px! w-px! overflow-hidden! whitespace-nowrap! border-0! p-0! [clip:rect(0,0,0,0)]!'>
        Loading...
      </span>
    </div>
  </div>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route element={<PersistAuth />}>
        <Route element={<AnonymousOnly />}>
          <Route
            path='register/:code?'
            element={
              <Suspense fallback={<PageLoader />}>
                <OnboardingForm />
              </Suspense>
            }
          />
          <Route
            path='login'
            element={
              <Suspense fallback={<PageLoader />}>
                <LoginForm />
              </Suspense>
            }
          />
        </Route>
        {/* PUBLIC ROUTES ACCESSIBLE TO ALL */}
        <Route
          index
          element={
            <Suspense fallback={<PageLoader />}>
              <Dashboard />
            </Suspense>
          }
        />
        <Route
          path='strategies'
          element={
            <Suspense fallback={<PageLoader />}>
              <FullStrategyList />
            </Suspense>
          }
        />
        <Route
          path='strategies/:id'
          element={
            <Suspense fallback={<PageLoader />}>
              <ViewStrategy />
            </Suspense>
          }
        />

        <Route
          path='faq'
          element={
            <Suspense fallback={<PageLoader />}>
              <FAQ />
            </Suspense>
          }
        />
        <Route
          path='terms-of-service'
          element={
            <Suspense fallback={<PageLoader />}>
              <LazyMarkdownPage importContent={importTos} />
            </Suspense>
          }
        />
        <Route
          path='privacy-policy'
          element={
            <Suspense fallback={<PageLoader />}>
              <LazyMarkdownPage importContent={importPrivacy} />
            </Suspense>
          }
        />
        <Route
          path='policies'
          element={
            <Suspense fallback={<PageLoader />}>
              <FocusAreaList />
            </Suspense>
          }
        />

        {/* AUTH NEEDED */}
        <Route element={<ProtectRoute allowedRoles={[]} />}>
          <Route
            path='my-strategies'
            element={
              <Suspense fallback={<PageLoader />}>
                <AssignedStrategies />
              </Suspense>
            }
          />
          <Route
            path='profile'
            element={
              <Suspense fallback={<PageLoader />}>
                <ProfileContainer />
              </Suspense>
            }
          />
        </Route>

        {/* AUTH - CPIC Members
         --update strategy details, add notes, resources, add stakeholder info
        */}

        {/* AUTH - CPIC Admin */}
        <Route
          element={
            <ProtectRoute
              allowedRoles={['Admin', 'CPIC Admin']}
              message='Only CPIC Admins can edit these strategy details.'
            />
          }
        >
          <Route
            path='strategies/:id/edit'
            element={
              <Suspense fallback={<PageLoader />}>
                <StrategyForm />
              </Suspense>
            }
          />
        </Route>

        {/* AUTH - Admin + CPIC Admin management pages */}
        <Route
          element={
            <ProtectRoute
              allowedRoles={['Admin', 'CPIC Admin']}
              message='Only Admins and CPIC Admins can manage these resources.'
            />
          }
        >
          <Route
            path='admin/focus-areas'
            element={
              <Suspense fallback={<PageLoader />}>
                <ManageFocusAreas />
              </Suspense>
            }
          />
          <Route
            path='admin/policies'
            element={
              <Suspense fallback={<PageLoader />}>
                <ManagePolicies />
              </Suspense>
            }
          />
          <Route
            path='admin/implementers'
            element={
              <Suspense fallback={<PageLoader />}>
                <ManageImplementers />
              </Suspense>
            }
          />
        </Route>

        {/* AUTH - CPIC Implementers */}

        {/* AUTH - ADMIN ONLY */}
        <Route
          path='admin/*'
          element={<ProtectRoute allowedRoles={['Admin']} />}
        >
          <Route index element={<Text>Admin Landing page</Text>} />
          <Route
            path='users'
            element={
              <Suspense fallback={<PageLoader />}>
                <UserManager title={'Manage Users'} />
              </Suspense>
            }
          />
          <Route path='roles' element={<Text>Manage Roles</Text>} />
          <Route path='permissions' element={<Text>Manage Permissions</Text>} />
          <Route path='*' element={<NotFound />} />
        </Route>

        <Route path='unauthorized' element={<NotAuthorized />} />

        <Route path='*' element={<NotFound />} />
      </Route>
    </Route>
  </Routes>
);

export default AppRoutes;
