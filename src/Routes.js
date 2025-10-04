import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { PersistAuth } from './features/auth/PersistAuth.js';
import { ProtectRoute } from './features/auth/ProtectRoute';
import { AnonymousOnly } from './features/auth/AnonymousOnly';
import { Layout } from './components/layout/Layout';
import { Text } from './components/catalyst/text.jsx';

//PUBLIC ROUTE COMPONENTS
import { NotFound, NotAuthorized } from './components/Generic';

//import Examples from './components/forms/headless/Examples';
import Login from './features/auth/Login';
import CreateAccount from './features/users/CreateAccount';

//AUTH REQUIRED COMPONENTS
import { Profile } from './features/users/Profile';

//ADMIN ONLY COMPONENTS
import { Dashboard } from './components/Generic';
import { UserManager } from './features/users/UserManager.js';

import LandingPage from './Pages/LandingPage.js';
import { Graph } from './features/skydrop/Graph.js';
import { ShowAllStations } from './features/skydrop/ListAllLocations.js';
import ExampleBento from './components/layout/Bento.js';
import { StrategyList } from './features/strategies/StrategyList.js';
import { TableList } from './features/strategies/TestList.js';

const AppRoutes = () => (
  <Routes>
    <Route path='/' element={<Layout />}>
      <Route element={<PersistAuth />}>
        <Route element={<AnonymousOnly />}>
          <Route path='createaccount' element={<CreateAccount />} />
          <Route path='login' element={<Login />} />
        </Route>

        {/* PUBLIC ROUTES ACCESSIBLE TO ALL */}
        <Route index element={<LandingPage />} />
        <Route path='skydrop' element={<Graph />} />
        <Route path='skydroplist' element={<ShowAllStations />} />
        <Route path='chat' element={<ExampleBento />} />
        <Route path='strategies' element={<StrategyList />} />
        <Route path='testList' element={<TableList />} />

        {/* AUTH NEEDED */}
        <Route path='home/*' element={<ProtectRoute allowedRoles={[]} />}>
          <Route index element={<Text>Auth User redirected</Text>} />
        </Route>
        <Route element={<ProtectRoute allowedRoles={[]} />}>
          <Route path='profile' element={<Profile />} />
        </Route>

        {/* AUTH + ADMIN ONLY */}
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
