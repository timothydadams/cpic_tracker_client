import * as React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { Tooltip, TooltipContent, TooltipTrigger } from 'ui/tooltip';
import { DataTable } from 'components/DataTable.js';
import { Heading } from 'catalyst/heading';
import { Link } from 'catalyst/link';
import {
  MoreHorizontal,
  ArrowUpDown,
  HelpCircle,
  CircleOff,
  CheckCircle,
  Timer,
  Circle,
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
import {
  useGetAllStrategiesQuery,
  useGetAllStatusesQuery,
  useGetAllTimelineOptionsQuery,
} from './strategiesApiSlice';
import useAuth from 'hooks/useAuth';

import { useGetAllPoliciesQuery } from '../policies/policiesApiSlice.js';
import { useGetAllFocusAreasQuery } from '../focus_areas/focusAreaApiSlice';

import { DataTableColumnHeader } from 'components/datatable-column-header';
import { DataTableRowActions } from 'components/datatable-row-actions';
import { Loading } from 'components/Spinners';
import { Modal } from 'components/modal';
import { useSelector } from 'react-redux';
import { selectStatuses } from './strategiesSlice';
//import { StrategyForm } from './EditStrategyForm';

/*
const EditFormInModal = ({strategy, ...props}) => {
  console.log('props:', props);
  return (
  <Modal {...props} >
    <StrategyForm strategy={strategy} />
  </Modal>
);
}
*/

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
  let Icon = null;
  if (status === 'Needs Updating') {
    Icon = HelpCircle;
  } else if (status === 'Not Started') {
    Icon = CircleOff;
  } else if (status === 'In Progress') {
    Icon = Timer;
  } else if (status === 'Completed') {
    Icon = CheckCircle;
  }
  return (
    <div className='items-center text-center gap-2'>
      {/* <Icon className="text-muted-foreground size-4" /> */}
      <Tooltip>
        <TooltipTrigger>
          <Icon className='text-muted-foreground size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>{status}</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

const columnHelper = createColumnHelper();

const allColumns = [
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
    id: 'timeline',
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
    //cell: TruncatedCellWithToolTip,
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
          # of Implementers
          <ArrowUpDown className='ml-2 h-4 w-4' />
        </Button>
      );
    },
    cell: ({ row }) => {
      const { implementers = [] } = row.original;
      return (
        <div className='text-center'>
          <Tooltip>
            <TooltipTrigger>{`${implementers.length}`}</TooltipTrigger>
            <TooltipContent>
              {implementers.map(({ implementer }) => (
                <p key={implementer.id}>{implementer.name}</p>
              ))}
            </TooltipContent>
          </Tooltip>
        </div>
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
              Copy strategy details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`${strategy.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>CPIC Actions</DropdownMenuLabel>
            <DropdownMenuItem>Request Implementer Update</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    meta: {
      roles: ['CPIC Member'],
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }) => {
      const strategy = row.original;
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
              Copy strategy details
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href={`${strategy.id}`}>View Details</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    meta: {
      roles: [],
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => 'Actions',
    meta: {
      roles: ['Admin', 'CPIC Admin'],
    },
    cell: ({ row }) => {
      const strategy = row.original;
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
            {/*<DropdownMenuItem onClick={() => navigator.clipboard.writeText(JSON.stringify(strategy))}>
              Copy strategy details
            </DropdownMenuItem> */}
            <DropdownMenuItem>
              <Link href={`${strategy.id}`}>View Details</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>CPIC Actions</DropdownMenuLabel>
            <DropdownMenuItem>Request Implementer Update</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Link href={`${strategy.id}/edit`}>Edit</Link>
            </DropdownMenuItem>
            {/**
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <EditFormInModal size="4xl" buttonText="Edit" strategy={strategy} />
            </DropdownMenuItem>
             */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  }),
];

export const StrategyList = () => {
  const user = useAuth();
  const { roles } = user;

  console.log('user roles', roles);

  // Conditionally generate the columns based on the user's role
  const columns = React.useMemo(() => {
    return allColumns.filter(
      (column) =>
        (column.meta?.roles.length === 0 && roles.length === 0) ||
        !column.meta?.roles ||
        column.meta.roles.some((r) => roles.includes(r))
    );
  }, [roles]);

  const { data: strategies } = useGetAllStrategiesQuery();
  const { data: statusOptions } = useGetAllStatusesQuery();
  //const statusOptions = useSelector(selectStatuses);
  //const altLimit = useSelector(selectCurrentAlt);
  const { data: timelineOptions } = useGetAllTimelineOptionsQuery();
  const { data: policies } = useGetAllPoliciesQuery({
    area: 'true',
    strategies: 'false',
  });
  const { data: focusareas } = useGetAllFocusAreasQuery();

  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    if (
      strategies &&
      statusOptions &&
      timelineOptions &&
      policies &&
      focusareas
    ) {
      setIsLoading(false);
    } else {
      setIsLoading(true);
    }
  }, [strategies, statusOptions, timelineOptions, policies, focusareas]);

  const addIconsToStatusOptions = (item) => {
    if (item.label === 'Needs Updating') return { ...item, icon: HelpCircle };
    if (item.label === 'Not Started') return { ...item, icon: CircleOff };
    if (item.label === 'In Progress') return { ...item, icon: Timer };
    if (item.label === 'Completed') return { ...item, icon: CheckCircle };
    return item;
  };

  return isLoading ? (
    <Loading />
  ) : (
    <>
      <Heading>Strategies</Heading>
      <div className='container mx-auto py-10'>
        <DataTable
          data={strategies}
          columns={columns}
          columnSearch={{
            columnId: 'content',
            placeholder: 'Filter strategies...',
          }}
          filters={[
            {
              column: 'status',
              title: 'Statuses',
              options: statusOptions
                .map(({ title }) => ({
                  value: title,
                  label: title,
                }))
                .map(addIconsToStatusOptions),
            },
            {
              column: 'timeline',
              title: 'Execution Horizon',
              options: timelineOptions.map(({ title }) => ({
                value: title,
                label: title,
              })),
            },
            {
              column: 'focusArea',
              title: 'Recommended Area',
              options: focusareas.map(({ name }) => ({
                value: name,
                label: name,
              })),
            },
            {
              column: 'policy',
              title: 'Related Policy',
              options: policies.map((item) => {
                return {
                  value: item.description,
                  label: item.description,
                };
              }),
            },
          ]}
        />
      </div>
    </>
  );
};
