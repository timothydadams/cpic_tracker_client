import React from 'react';
import { Card, CardContent, CardHeader } from 'ui/card';
import { Skeleton } from 'ui/skeleton';

export const KpiCardSkeleton = () => (
  <Card>
    <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
      <Skeleton className='h-4 w-24' />
      <Skeleton className='h-4 w-4' />
    </CardHeader>
    <CardContent>
      <Skeleton className='h-8 w-20 mb-1' />
      <Skeleton className='h-3 w-32' />
    </CardContent>
  </Card>
);

export const ChartSkeleton = ({ className }) => (
  <Card className={className}>
    <CardHeader>
      <Skeleton className='h-5 w-40' />
      <Skeleton className='h-3 w-24' />
    </CardHeader>
    <CardContent>
      <Skeleton className='h-[250px] w-full rounded-lg' />
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5, cols = 6 }) => (
  <div className='space-y-2'>
    <div className='flex gap-4'>
      {Array.from({ length: cols }).map((_, j) => (
        <Skeleton key={j} className='h-8 flex-1 rounded' />
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className='flex gap-4'>
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className='h-10 flex-1 rounded' />
        ))}
      </div>
    ))}
  </div>
);
