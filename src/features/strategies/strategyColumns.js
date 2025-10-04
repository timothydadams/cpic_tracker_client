import { createColumnHelper } from '@tanstack/react-table';
import { TruncatedCellWithToolTip } from './TestList';

const columnHelper = createColumnHelper();

export const columns = [
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
  columnHelper.accessor('visits', {
    header: () => <span>Visits</span>,
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    footer: (info) => info.column.id,
  }),
  columnHelper.accessor('progress', {
    header: 'Profile Progress',
    footer: (info) => info.column.id,
  }),
];
