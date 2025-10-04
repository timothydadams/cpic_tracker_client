import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/catalyst/table.jsx';
import { useGetAllStrategiesQuery } from './strategiesApiSlice.js';

//import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

//const HasRole = () => <CheckIcon className="size-6 text-green-500" />
//const NoRole = () => <XMarkIcon className="size-6 text-rose-500"/>

import { Loading } from '../../components/Spinners.js';

export function StrategyList() {
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetAllStrategiesQuery();

  return isLoading ? (
    <Loading />
  ) : (
    data && isSuccess && (
      <Table
        grid
        dense
        className='[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]'
      >
        <TableHead>
          <TableRow>
            <TableHeader>Id</TableHeader>
            <TableHeader>Content</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Timeline</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((record) => (
            <TableRow key={record.id}>
              <TableCell>{record.id}</TableCell>
              <TableCell>{record.content}</TableCell>
              <TableCell>{record.status.title}</TableCell>
              <TableCell>{record.timeline.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  );
}
