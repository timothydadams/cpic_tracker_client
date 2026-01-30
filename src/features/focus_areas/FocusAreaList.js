import React from 'react';
import { useGetAllFocusAreasQuery } from './focusAreaApiSlice';
import { useGetAllStrategiesQuery } from '../strategies/strategiesApiSlice';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from 'ui/accordion';

import {
  MoreHorizontal,
  ArrowUpDown,
  HelpCircle,
  CircleOff,
  CheckCircle,
  Timer,
  Circle,
} from 'lucide-react';

import { Button } from 'ui/button';

import { ColumnVisibility, createColumnHelper } from '@tanstack/react-table';
import { DataTableColumnHeader } from 'components/datatable-column-header';

import { useMediaQuery } from '@uidotdev/usehooks';

import { Loading } from 'components/Spinners';

import { Skeleton } from 'ui/skeleton';

import { DataTable } from 'components/DataTable.js';

import { StrategyCard } from '../strategies/StrategyCard';

import { api } from '../../app/api/apiSlice';

import { StatusBadge } from 'components/data-table-util-components';

const columnHelper = createColumnHelper();

const allColumns = [
  columnHelper.accessor('status.title', {
    id: 'status',
    cell: ({ cell, row }) => {
      return <StatusBadge status={row.original.status.title} />;
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' preventHide />
    ),
    footer: (info) => info.column.id,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.display({
    id: 'policy-strategy',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Ref #
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row, table }) => {
      const strategy = row.original;
      const { policy } = table.options.meta;
      return (
        <div className='text-center'>
          {`${policy.policy_number}.${strategy.strategy_number}`}
        </div>
      );
    },
    accessorFn: (row, table) => {
      return Number(row.strategy_number);
    },
    sortingFn: (rowA, rowB) => {
      const rowA_num = Number(rowA.original.strategy_number);
      const rowB_num = Number(rowB.original.strategy_number);
      return rowA_num > rowB_num ? 1 : rowA_num < rowB_num ? -1 : 0;
    },
    sortDescFirst: false,
  }),
  columnHelper.accessor('timeline.title', {
    id: 'timeline',
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Execution Horizon'
        preventHide
      />
    ),
    footer: (info) => info.column.id,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor('content', {
    id: 'content',
    header: 'Strategy Name',
    cell: (info) => info.getValue(),
    footer: (info) => info.column.id,
  }),
  columnHelper.display({
    id: 'implementers',
    header: ({ column }) => {
      return (
        <Button
          variant='ghost'
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Implementers
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { implementers = [] } = row.original;
      return (
        <div className='text-center'>
          {implementers.map(({ implementer }) => (
            <p key={implementer.id}>{implementer.name}</p>
          ))}
        </div>
      );
    },
    accessorFn: (row) => {
      const { implementers = [] } = row;
      return parseInt(implementers.length, 10);
    },
  }),
];

/*

<DataTable
        data={strategies}
        columns={allColumns}
        initialState={{
          sorting: [
            {
              id: 'policy-strategy',
              desc: false,
            },
          ],
          columnVisibility: {
            //"strategy_number":false,
          },
        }}
        metaData={{
          policy,
        }}
      />

*/

const StrategyTableList = ({ policy }) => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  const { data: strategies, isLoading } = useGetAllStrategiesQuery({
    policy: policy.id,
    include: 'implementers,implementers.implementer.cpic_smes,timeline,status',
    orderBy: JSON.stringify({
      strategy_number: 'asc',
    }),
  });

  if (isLoading || !strategies) {
    return <Skeleton className='w-[200px] h-[200px]' />;
  }

  return isSmallDevice ? (
    <div className='w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'>
      {strategies.map((s) => (
        <StrategyCard
          strategy={{ ...s, policy }}
          implementerDetails={{}}
          key={s.id}
          userType='guest'
        />
      ))}
    </div>
  ) : (
    <DataTable
      data={strategies}
      columns={allColumns}
      initialState={{
        sorting: [
          {
            id: 'policy-strategy',
            desc: false,
          },
        ],
        columnVisibility: {
          //"strategy_number":false,
        },
      }}
      metaData={{
        policy,
      }}
    />
  );
};

export const FocusAreaList = () => {
  const { data, isLoading } = useGetAllFocusAreasQuery({ policies: 'true' });
  const prefetch = api.usePrefetch('getAllStrategies');

  const handleMouseEnter = (policy_id) => {
    prefetch({
      policy: policy_id,
      include:
        'implementers,implementers.implementer.cpic_smes,timeline,status',
      orderBy: JSON.stringify({
        strategy_number: 'asc',
      }),
    });
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    data && (
      <Accordion
        type='single'
        collapsible
        className='w-full'
        transform='translate3d(0,0,0)'
        defaultValue=''
      >
        {data.map((fa) => {
          return (
            <AccordionItem key={fa.id} value={fa.id}>
              <AccordionTrigger>{fa.name}</AccordionTrigger>
              <AccordionContent className='flex flex-col gap-4 text-balance'>
                <div>{fa.description}</div>
                <Accordion
                  key={fa.id}
                  type='single'
                  collapsible
                  className='w-full pl-5'
                  defaultValue=''
                >
                  {fa.policies.map((p) => {
                    return (
                      <AccordionItem key={p.id} value={p.id}>
                        <AccordionTrigger
                          onMouseEnter={() => handleMouseEnter(p.id)}
                        >{`${p.policy_number}. ${p.description}`}</AccordionTrigger>
                        <AccordionContent className='flex flex-col gap-4 text-balance'>
                          <StrategyTableList policy={p} />
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    )
  );
};
