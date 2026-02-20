import React from 'react';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from 'features/auth/authSlice';
import { Heading } from 'catalyst/heading';
import { Text } from 'catalyst/text';
import { FeatureFlagsSection } from './FeatureFlagsSection';
import { ScorecardConfigSection } from './ScorecardConfigSection';

export const AppSettingsPage = () => {
  const { isAdmin, isCPICAdmin } = useSelector(selectMemoizedUser);

  return (
    <div className='space-y-8'>
      <div>
        <Heading>App Settings</Heading>
        <Text>Configure application-wide settings and preferences.</Text>
      </div>

      {(isAdmin || isCPICAdmin) && <ScorecardConfigSection />}

      {isAdmin && <FeatureFlagsSection />}
    </div>
  );
};
