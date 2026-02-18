import React from 'react';
import { Outlet } from 'react-router-dom';
import { Heading } from 'catalyst/heading';

export const MetricsPage = () => {
  return (
    <div className='space-y-6'>
      <Heading>Plan Metrics</Heading>
      <Outlet />
    </div>
  );
};
