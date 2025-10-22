import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { PersistAuth } from './features/auth/PersistAuth.js';
import { ProtectRoute } from './features/auth/ProtectRoute';
import { AnonymousOnly } from './features/auth/AnonymousOnly';
import { Layout } from 'components/layout/Layout';
import { Text } from 'catalyst/text';

//PUBLIC ROUTE COMPONENTS
import { NotFound, NotAuthorized } from 'components/Generic';

//import Examples from './components/forms/headless/Examples';
import Login from './features/auth/Login';
import CreateAccount from './features/users/CreateAccount';

//AUTH REQUIRED COMPONENTS
import { Profile } from './features/users/Profile';

//ADMIN ONLY COMPONENTS
import { UserManager } from './features/users/UserManager.js';

import { Dashboard } from './Pages/Dashboard.js';
import { StrategyList } from './features/strategies/StrategyList.js';
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
          {/* <Route path='createaccount' element={<CreateAccount />} /> */}
          <Route path='login' element={<Login />} />
        </Route>

        {/* PUBLIC ROUTES ACCESSIBLE TO ALL */}
        <Route index element={<Dashboard />} />
        <Route path='strategies' element={<StrategyList />} />
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
        <Route path='home/*' element={<ProtectRoute allowedRoles={[]} />}>
          <Route index element={<Text>Auth User redirected</Text>} />
        </Route>
        <Route element={<ProtectRoute allowedRoles={[]} />}>
          <Route path='profile' element={<Profile />} />
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
