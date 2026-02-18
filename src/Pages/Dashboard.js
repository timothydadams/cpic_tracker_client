import React from 'react';
import { Link } from 'react-router-dom';
import { Heading } from 'catalyst/heading.jsx';
import { Text } from 'catalyst/text.jsx';
import { ChartNoAxesCombinedIcon, GoalIcon } from 'lucide-react';

export const Dashboard = () => {
  return (
    <div className='space-y-6'>
      <Heading>CPIC Tracker</Heading>
      <div className='grid gap-4 grid-cols-1 sm:grid-cols-2 max-w-lg'>
        <Link
          to='/metrics'
          className='flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'
        >
          <ChartNoAxesCombinedIcon className='h-5 w-5 text-muted-foreground' />
          <div>
            <Text className='font-medium'>View Metrics</Text>
            <Text className='text-sm text-muted-foreground'>
              Plan progress, timelines, and scorecards
            </Text>
          </div>
        </Link>
        <Link
          to='/strategies'
          className='flex items-center gap-3 rounded-lg border border-zinc-200 dark:border-zinc-800 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors'
        >
          <GoalIcon className='h-5 w-5 text-muted-foreground' />
          <div>
            <Text className='font-medium'>All Strategies</Text>
            <Text className='text-sm text-muted-foreground'>
              Browse and search all strategies
            </Text>
          </div>
        </Link>
      </div>
    </div>
  );
};
