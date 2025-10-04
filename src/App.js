import React from 'react';
import AppRoutes from './Routes';
import { PersistAuth } from './features/auth/PersistAuth';
import { useScrollToTop } from './Hooks/useScrollToTop';

const App = () => {
  useScrollToTop();
  return <AppRoutes />;
};

export default App;
