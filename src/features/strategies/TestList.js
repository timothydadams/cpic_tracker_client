import React from 'react';
import { DynamicTable } from '../../components/Table.js';
import { createColumnHelper, flexRender } from '@tanstack/react-table';

import { Text } from '../../components/catalyst/text.jsx';
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';

import { Tooltip, TooltipContent, TooltipTrigger } from 'ui/tooltip.jsx';
import { DataTable } from 'components/DataTable.js';

import { MoreHorizontal } from 'lucide-react';
import { Button } from 'ui/button.jsx';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';

//import { Button } from 'catalyst/button.jsx';

//import { columns } from './strategyColumns.js';
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

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.accessor('status.title', {
    cell: (info) => info.getValue(),
    header: () => <span>Status</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('timeline.title', {
    cell: (info) => info.getValue(),
    header: () => <span>Execution Horizon</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('content', {
    header: () => 'Strategy Description',
    cell: TruncatedCellWithToolTip,
    footer: (info) => info.column.id,
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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(id)}>
              Copy payment ID
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

export const TableList = () => {
  return (
    <>
      <DynamicTable data={defaultData} columns={columns} />
      <div className='container mx-auto py-10'>
        <DataTable data={defaultData} columns={columns} />
      </div>
    </>
  );
};
