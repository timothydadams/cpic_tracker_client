import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { PersistAuth } from './features/auth/PersistAuth.js';
import { ProtectRoute } from './features/auth/ProtectRoute';
import { AnonymousOnly } from './features/auth/AnonymousOnly';
import { Layout } from 'components/layout/Layout';
import { Text } from 'catalyst/text';

//PUBLIC ROUTE COMPONENTS
import { NotFound, NotAuthorized } from 'components/Generic';
import { LoginForm } from './features/auth/LoginForm.jsx';
import { AddPasswordForm } from './features/auth/AddPasswordForm.jsx';
import { UserRegistrationForm } from './features/auth/RegisterForm.js';
import { VerifyInvitationCode } from './features/auth/onboarding/InvitationCode.js';
import { OnboardingForm } from './features/auth/onboarding/OnboardNewUser.js';

//AUTH REQUIRED COMPONENTS
import { ProfileContainer } from './features/users/Profile';

//ADMIN ONLY COMPONENTS
import { UserManager } from './features/users/UserManager.js';

import { Dashboard } from './Pages/Dashboard.js';
import { FullStrategyList } from './features/strategies/StrategyList.js';
import { AssignedStrategies } from './features/strategies/AssignedStrategies.js';
import { FocusAreaList } from './features/focus_areas/FocusAreaList.js';
import { ViewStrategy } from './features/strategies/ViewStrategy.js';
import { StrategyForm } from './features/strategies/EditStrategyForm.js';
import { FAQ } from './features/faq/faq.js';

import { MarkdownWrapper } from 'components/layout/MarkdownWrapper.js';
import privacyPolicy from 'components/layout/PrivacyNotice.md';
import tos from 'components/layout/TOS.md';
import Markdown from 'react-markdown';

const MarkdownPage = ({ contents }) => (
  <MarkdownWrapper>
    <Markdown>{contents}</Markdown>
  </MarkdownWrapper>
);

const AppRoutes = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route element={<PersistAuth />}>
        <Route element={<AnonymousOnly />}>
          <Route path='register/:code?' element={<OnboardingForm />} />
          <Route path='login' element={<LoginForm />} />
        </Route>

        {/* PUBLIC ROUTES ACCESSIBLE TO ALL */}
        <Route index element={<Dashboard />} />
        <Route path='strategies' element={<FullStrategyList />} />
        <Route path='strategies/:id' element={<ViewStrategy />} />

        <Route path='faq' element={<FAQ />} />
        <Route
          path='terms-of-service'
          element={<MarkdownPage contents={tos} />}
        />
        <Route
          path='privacy-policy'
          element={<MarkdownPage contents={privacyPolicy} />}
        />
        <Route path='policies' element={<FocusAreaList />} />

        {/* AUTH NEEDED */}
        <Route element={<ProtectRoute allowedRoles={[]} />}>
          <Route path='my-strategies' element={<AssignedStrategies />} />
          <Route path='profile' element={<ProfileContainer />} />
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
          <Route path='strategies/:id/edit' element={<StrategyForm />} />
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
            element={<UserManager title={'Manage Users'} />}
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
