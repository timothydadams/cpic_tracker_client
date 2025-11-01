import * as React from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import {
  HybridTooltipProvider,
  HybridTooltip,
  HybridTooltipTrigger,
  HybridTooltipContent,
} from 'ui/hybrid-tooltip';
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
import useAuth from 'hooks/useAuth';

import { DataTableColumnHeader } from 'components/datatable-column-header';
import { DataTableRowActions } from 'components/datatable-row-actions';
import { Loading } from 'components/Spinners';
import { Modal } from 'components/Modal';

export const StatusBadge = ({ status }) => {
  //const status = cell.getValue();
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
      <HybridTooltipProvider>
        <HybridTooltip>
          <HybridTooltipTrigger>
            <Icon className='text-muted-foreground size-4' />
          </HybridTooltipTrigger>
          <HybridTooltipContent>
            <p>{status}</p>
          </HybridTooltipContent>
        </HybridTooltip>
      </HybridTooltipProvider>
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
