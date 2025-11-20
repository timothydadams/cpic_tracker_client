import React from 'react';
import AppRoutes from './Routes';
import { useScrollToTop } from 'hooks/useScrollToTop';

const App = () => {
  useScrollToTop();
  return <AppRoutes />;
};

export default App;
