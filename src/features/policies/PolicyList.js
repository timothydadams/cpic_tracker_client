import React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Tooltip, TooltipContent, TooltipTrigger } from 'ui/tooltip';
import { DataTable } from 'components/DataTable.js';
import { Heading } from 'catalyst/heading';
import { MoreHorizontal, ArrowUpDown, HelpCircle } from 'lucide-react';
import {
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  Circle,
  CircleOff,
  Timer,
} from 'lucide-react';
import { Button } from 'ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';
import { Badge } from 'ui/badge';
import {} from './policiesApiSlice';

import { DataTableColumnHeader } from 'components/datatable-column-header';
import { DataTableRowActions } from 'components/datatable-row-actions';

export const TruncatedCellWithToolTip = ({ cell }) => {
  const cellVal = cell.getValue();
  const shortText = `${cellVal.substring(0, 22)}...`;
  return (
    <Tooltip>
      <TooltipTrigger>{shortText}</TooltipTrigger>
      <TooltipContent>
        <p>{cellVal}</p>
      </TooltipContent>
    </Tooltip>
  );
};

export const StatusBadge = ({ cell }) => {
  const status = cell.getValue();
  if (status === 'Needs Updating') {
    return <Badge variant='destructive'>{status}</Badge>;
  } else if (status === 'In Progress') {
    return <Badge variant='outline'>{status}</Badge>;
  } else if (status === 'Complete') {
    return <Badge variant='primary'>{status}</Badge>;
  } else {
    return <Badge variant='secondary'>{status}</Badge>;
  }
};

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('status.title', {
    id: 'status',
    cell: StatusBadge,
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    footer: (info) => info.column.id,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor('timeline.title', {
    id: 'title',
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Execution Horizon' />
    ),
    footer: (info) => info.column.id,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor('content', {
    id: 'content',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Strategy Description' />
    ),
    cell: TruncatedCellWithToolTip,
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
          # of Implementers
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { implementers = [] } = row.original;
      const l = implementers.length;
      return (
        <Tooltip>
          <TooltipTrigger>{`${implementers.length}`}</TooltipTrigger>
          <TooltipContent>
            {implementers.map(({ implementer }) => (
              <p>{implementer.name}</p>
            ))}
          </TooltipContent>
        </Tooltip>
      );
    },
    accessorFn: (row) => {
      const { implementers = [] } = row;
      return parseInt(implementers.length, 10);
    },
  }),
  columnHelper.accessor('policy.description', {
    id: 'policy',
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Policy' />
    ),
    footer: (info) => info.column.id,
    enableHiding: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.accessor('policy.area.name', {
    id: 'focusArea',
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Focus Area' />
    ),
    footer: (info) => info.column.id,
    enableHiding: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }) => {
      const strategy = row.original;
      const { id } = strategy;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant='ghost' className='h-8 w-8 p-0'>
              <span className='sr-only'>Open menu</span>
              <MoreHorizontal className='h-4 w-4' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() =>
                navigator.clipboard.writeText(JSON.stringify(strategy))
              }
            >
              Copy strategy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>View</DropdownMenuItem>
            <DropdownMenuItem>Edit</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

const defaultData = [
  {
    id: 1,
    content:
      'Promote future endeavors at Norcross Point such as more concerts and theatrical offerings in the open-air stage',
    last_comms_date: null,
    createdAt: '2025-09-13T17:41:05.656Z',
    updatedAt: '2025-09-13T17:41:05.656Z',
    policy_id: '2d056291-6508-4b79-9781-2e8672180890',
    strategy_number: 5,
    timeline_id: 2,
    status_id: 1,
    implementers: [
      {
        implementer_id: 26,
        strategy_id: 1,
        order_number: 2,
        createdAt: '2025-09-13T23:06:49.361Z',
        updatedAt: '2025-09-13T23:20:42.307Z',
        implementer: {
          id: 26,
          name: 'Recreation Committee',
          createdAt: '2025-09-13T22:23:40.782Z',
          updatedAt: '2025-09-13T22:23:40.782Z',
          is_board: true,
          is_department: false,
          is_school: false,
          cpic_smes: [],
        },
      },
      {
        implementer_id: 35,
        strategy_id: 1,
        order_number: 1,
        createdAt: '2025-09-13T23:06:49.493Z',
        updatedAt: '2025-09-13T23:20:42.367Z',
        implementer: {
          id: 35,
          name: 'Town Manager',
          createdAt: '2025-09-13T22:23:40.782Z',
          updatedAt: '2025-09-13T22:23:40.782Z',
          is_board: false,
          is_department: true,
          is_school: false,
          cpic_smes: [],
        },
      },
    ],
    timeline: {
      id: 2,
      title: 'Short-Term',
    },
    policy: {
      id: '2d056291-6508-4b79-9781-2e8672180890',
      description:
        'Work to establish a calendar of year-round community events',
      policy_number: 5,
      focus_area_id: 7,
      area: {
        id: 7,
        name: 'Recreation and Culture',
      },
    },
    status: {
      id: 1,
      title: 'Needs Updating',
    },
  },
];

export const StrategyList = () => {
  const { data: strategies, isSuccess } = useGetAllStrategiesQuery();
  const { data: statusOptions } = useGetAllStatusesQuery();
  const { data: timelineOptions } = useGetAllTimelineOptionsQuery();
  const { data: policies } = useGetAllPoliciesQuery();
  const { data: focusareas } = useGetAllFocusAreasQuery();

  return (
    strategies &&
    policies &&
    focusareas &&
    statusOptions &&
    timelineOptions && (
      <>
        <Heading>Strategies</Heading>
        <div className='container mx-auto py-10'>
          <DataTable
            data={strategies}
            columns={columns}
            filters={[
              {
                column: 'status',
                title: 'Statuses',
                options: statusOptions,
              },
              {
                column: 'title',
                title: 'Timeline',
                options: timelineOptions,
              },
              {
                column: 'focusArea',
                title: 'Recommended Area',
                options: focusareas,
              },
              {
                column: 'policy',
                title: 'Related Policy',
                options: policies,
              },
            ]}
          />
        </div>
      </>
    )
  );
};
