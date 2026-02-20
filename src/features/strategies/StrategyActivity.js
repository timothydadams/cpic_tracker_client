import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import { Badge } from 'ui/badge';
import { UserIdentity } from 'components/UserIdentity';
import { EmptyContainer } from 'components/EmptyContainer';
import { Dots } from 'components/Spinners';
import useAuth from 'hooks/useAuth';
import { useGetStrategyActivitiesQuery } from './strategiesApiSlice';

export const StrategyActivity = ({ strategyId, activityCount }) => {
  const user = useAuth();
  const isGuest = user?.status === 'Guest';

  const {
    data: activities,
    isLoading,
    isError,
    error,
  } = useGetStrategyActivitiesQuery(
    { id: strategyId, params: { take: 50 } },
    {
      skip: isGuest,
      selectFromResult: ({ data, isLoading, isError, error }) => ({
        data,
        isLoading,
        isError,
        error,
      }),
    }
  );

  const isUnauthorized =
    isGuest || error?.status === 401 || error?.status === 403;

  return (
    <Card>
      <CardHeader className='pb-3'>
        <CardTitle className='text-sm font-medium'>
          Activity{activityCount != null ? ` (${activityCount})` : ''}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isUnauthorized ? (
          <EmptyContainer
            title='Sign in to view activity'
            description='The activity log is available to registered users.'
          />
        ) : isLoading ? (
          <Dots />
        ) : isError ? (
          <EmptyContainer
            title='Unable to load activity'
            description='Something went wrong. Please try again later.'
          />
        ) : !activities || activities.length === 0 ? (
          <EmptyContainer
            title='No activity yet'
            description='Changes to this strategy will appear here.'
          />
        ) : (
          <div className='flex flex-col gap-3'>
            {activities.map((activity) => (
              <div
                key={activity.id}
                className='flex flex-col gap-1 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800'
              >
                <UserIdentity
                  user={activity.user}
                  isAuthenticated={!isGuest}
                  timestamp={activity.createdAt}
                />
                <div className='pl-11 flex flex-col gap-1'>
                  <Badge variant='outline' className='text-xs w-fit'>
                    {activity.action}
                  </Badge>
                  <pre className='text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-sans'>
                    {activity.summary}
                  </pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
