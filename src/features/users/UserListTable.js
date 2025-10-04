import { Avatar } from '../../components/catalyst/avatar.jsx';
import { Badge } from '../../components/catalyst/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/catalyst/table.jsx';
//import { Text } from '../../components/catalyst/text.jsx';
import { UserAvatar } from '../../components/layout/UserAvatar.js';
import { EditRolesModal } from './UserRolesModal.js';
import { useGetRolesQuery } from './usersApiSlice.js';

import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';

const HasRole = () => <CheckIcon className='size-6 text-green-500' />;
const NoRole = () => <XMarkIcon className='size-6 text-rose-500' />;

export function UserList({ users }) {
  const { data, isLoading, isFetching, isSuccess, isError, error } =
    useGetRolesQuery();

  const checkUserRoles = (userRoles, key) => {
    return [key].some((needle) => userRoles.includes(needle));
  };

  return (
    <Table
      grid
      dense
      className='[--gutter:--spacing(6)] sm:[--gutter:--spacing(8)]'
    >
      <TableHead>
        <TableRow>
          <TableHeader rowSpan='2' className='text-center'>
            User
          </TableHeader>
          <TableHeader rowSpan='2'>Status</TableHeader>
          <TableHeader rowSpan='1' colSpan='4' className='text-center'>
            Roles
          </TableHeader>
        </TableRow>
        <TableRow>
          <TableHeader>Global Admin</TableHeader>
          <TableHeader>CPIC Admin</TableHeader>
          <TableHeader>CPIC Member</TableHeader>
          <TableHeader>Viewer</TableHeader>
        </TableRow>
      </TableHead>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className='flex items-center gap-4'>
                <UserAvatar user={user} className='size-12' />
                <div>
                  <div className='font-medium'>
                    {user.given_name} {user.family_name}
                  </div>
                  <div className='text-zinc-500'>
                    <EditRolesModal
                      user={{ id: user.id, email: user.email }}
                      availableRoles={data}
                    />
                  </div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              {user.disabled === false ? (
                <Badge color='lime'>Enabled</Badge>
              ) : (
                <Badge color='rose'>Disabled</Badge>
              )}
            </TableCell>
            <TableCell>
              {checkUserRoles(user.roles, 'Admin') ? <HasRole /> : <NoRole />}
            </TableCell>
            <TableCell>
              {checkUserRoles(user.roles, 'CPIC Admin') ? (
                <HasRole />
              ) : (
                <NoRole />
              )}
            </TableCell>
            <TableCell>
              {checkUserRoles(user.roles, 'CPIC Member') ? (
                <HasRole />
              ) : (
                <NoRole />
              )}
            </TableCell>
            <TableCell>
              {checkUserRoles(user.roles, 'Viewer') ? <HasRole /> : <NoRole />}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
