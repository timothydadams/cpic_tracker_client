import * as React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
//import { Tooltip, TooltipContent, TooltipTrigger } from 'ui/tooltip';
import {
  HybridTooltipProvider,
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from 'ui/hybrid-tooltip';

import { DataTable } from 'components/DataTable.js';
import { Heading } from 'catalyst/heading';
import {
  ArrowUpDown,
  HelpCircle,
  CircleOff,
  CheckCircle,
  Timer,
  Plus,
} from 'lucide-react';
import { Button } from 'ui/button.jsx';
import {
  useGetAllStrategiesQuery,
  useGetAllStatusesQuery,
  useGetAllTimelineOptionsQuery,
} from './strategiesApiSlice';

import { useGetAllPoliciesQuery } from '../policies/policiesApiSlice.js';
import { useGetAllFocusAreasQuery } from '../focus_areas/focusAreaApiSlice';

import { DataTableColumnHeader } from 'components/datatable-column-header';
import { Dots } from 'components/Spinners';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from '../auth/authSlice';
import { CreateStrategyForm } from './CreateStrategyForm';
import { ResponsiveFormModal } from 'components/ResponsiveFormModal';
import { StrategyActionCell } from './StrategyCard';
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
    <HybridTooltip>
      <HybridTooltipTrigger>{shortText}</HybridTooltipTrigger>
      <HybridTooltipContent>
        <p>{cellVal}</p>
      </HybridTooltipContent>
    </HybridTooltip>
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
      <HybridTooltip>
        <HybridTooltipTrigger>
          <Icon className='text-muted-foreground size-4' />
        </HybridTooltipTrigger>
        <HybridTooltipContent>
          <p>{status}</p>
        </HybridTooltipContent>
      </HybridTooltip>
      {/* <Icon className="text-muted-foreground size-4" /> 
      <Tooltip>
        <TooltipTrigger>
          <Icon className='text-muted-foreground size-4' />
        </TooltipTrigger>
        <TooltipContent>
          <p>{status}</p>
        </TooltipContent>
      </Tooltip>*/}
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
  columnHelper.accessor('focus_area.name', {
    id: 'focusArea',
    cell: (info) => info.getValue(),
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Focus Area' />
    ),
    footer: (info) => info.column.id,
    //enableHiding: false,
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
    cell: ({ row }) => {
      const strategy = row.original;
      return `${strategy.policy.policy_number}.${strategy.strategy_number}`;
    },
    accessorFn: (row) => {
      return parseFloat(`${row.policy.policy_number}.${row.strategy_number}`);
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
          <HybridTooltipProvider>
            <HybridTooltip>
              <HybridTooltipTrigger>{`${implementers.length}`}</HybridTooltipTrigger>
              <HybridTooltipContent>
                {implementers.map(({ implementer }) => (
                  <p key={implementer.id}>{implementer.name}</p>
                ))}
              </HybridTooltipContent>
            </HybridTooltip>
          </HybridTooltipProvider>

          {/* <Tooltip>
            <TooltipTrigger>{`${implementers.length}`}</TooltipTrigger>
            <TooltipContent>
              {implementers.map(({ implementer }) => (
                <p key={implementer.id}>{implementer.name}</p>
              ))}
            </TooltipContent>
          </Tooltip> */}
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
  columnHelper.display({
    id: 'actions',
    header: () => 'Actions',
    cell: ({ row }) => <StrategyActionCell strategy={row.original} />,
  }),
];

export const StrategyTableList = ({ strategies, title }) => {
  const { data: statusOptions } = useGetAllStatusesQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });
  const { data: timelineOptions } = useGetAllTimelineOptionsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });
  const { data: policies } = useGetAllPoliciesQuery(
    { area: 'true', strategies: 'false' },
    { selectFromResult: ({ data }) => ({ data }) }
  );
  const { data: focusareas } = useGetAllFocusAreasQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });
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
    <Dots />
  ) : (
    <HybridTooltipProvider>
      {title && <Heading>{title}</Heading>}
      <div className='container mx-auto py-10'>
        <DataTable
          data={strategies}
          columns={allColumns}
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
              title: 'Focus Area',
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
    </HybridTooltipProvider>
  );
};

export const FullStrategyList = () => {
  const { data: strategies, isLoading } = useGetAllStrategiesQuery(
    {
      include:
        'policy,focus_area,implementers,implementers.implementer.cpic_smes,timeline,status',
    },
    { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
  );

  const user = useSelector(selectMemoizedUser);
  const canCreate = user?.isAdmin || user?.isCPICAdmin;
  const [formOpen, setFormOpen] = React.useState(false);

  return isLoading ? (
    <Dots />
  ) : (
    <>
      <div className='flex items-center justify-between'>
        <Heading>Explore All Strategies</Heading>
        {canCreate && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className='h-4 w-4 mr-2' />
            Create Strategy
          </Button>
        )}
      </div>
      <StrategyTableList strategies={strategies} />

      <ResponsiveFormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) setFormOpen(false);
        }}
        title='Create Strategy'
        description='Add a new strategy to the comprehensive plan'
      >
        <CreateStrategyForm
          onSuccess={() => setFormOpen(false)}
          onCancel={() => setFormOpen(false)}
        />
      </ResponsiveFormModal>
    </>
  );
};
