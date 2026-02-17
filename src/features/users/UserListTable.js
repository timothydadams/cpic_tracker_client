import { Badge } from 'components/catalyst/badge';
import { DataTable } from 'components/DataTable.js';
import { UserAvatar } from 'components/layout/UserAvatar.js';
import { useGetRolesQuery } from './usersApiSlice.js';
import { CheckIcon, XMarkIcon } from '@heroicons/react/16/solid';
import { createColumnHelper } from '@tanstack/react-table';
import { Modal } from 'components/Modal.js';
import { EditRolesForm } from './EditUserRolesForm.js';

const HasRole = () => <CheckIcon className='size-6 text-green-500' />;
const NoRole = () => <XMarkIcon className='size-6 text-rose-500' />;

const checkUserRoles = (userRoles = [], key) => {
  return [key].some((needle) => userRoles.includes(needle));
};

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.display({
    id: 'user_details',
    header: () => 'User',
    cell: ({ row, table }) => {
      const user = row.original;
      const { roles, refetchUsers } = table.options.meta;

      return (
        <div className='flex items-center gap-4'>
          <UserAvatar user={user} className='size-12' />
          <div>
            <div className='font-medium'>
              {user.given_name} {user.family_name}
            </div>
            <div className='text-zinc-500'>
              <Modal
                buttonText={user.email}
                title={`Modify roles for ${user.email}`}
              >
                <EditRolesForm
                  user={{ id: user.id, email: user.email }}
                  availableRoles={roles}
                  refetchUsers={refetchUsers}
                />
              </Modal>
            </div>
          </div>
        </div>
      );
    },
    accessorFn: (row) => {
      return `${row.family_name} ${row.given_name} ${row.email}`;
    },
  }),
  columnHelper.accessor('disabled', {
    id: 'status',
    header: () => 'Status',
    cell: ({ row }) => {
      const user = row.original;
      return user.disabled === false ? (
        <Badge color='lime'>Enabled</Badge>
      ) : (
        <Badge color='rose'>Disabled</Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    accessorFn: (row) => {
      return row.disabled === false ? 'Enabled' : 'Disabled';
    },
  }),
  columnHelper.display({
    header: 'Admin',
    cell: ({ row }) => {
      const { roles } = row.original;
      return checkUserRoles(roles, 'Admin') ? <HasRole /> : <NoRole />;
    },
  }),
  columnHelper.display({
    header: 'CPIC Admin',
    cell: ({ row }) => {
      const { roles } = row.original;
      return checkUserRoles(roles, 'CPIC Admin') ? <HasRole /> : <NoRole />;
    },
  }),
  columnHelper.display({
    header: 'CPIC Member',
    cell: ({ row }) => {
      const { roles } = row.original;
      return checkUserRoles(roles, 'CPIC Member') ? <HasRole /> : <NoRole />;
    },
  }),
  columnHelper.display({
    header: 'Implementer',
    cell: ({ row }) => {
      const { roles } = row.original;
      return checkUserRoles(roles, 'Implementer') ? <HasRole /> : <NoRole />;
    },
  }),
];

export function UserList({ users, refetchUsers }) {
  const {
    data: appRoles,
    isLoading,
    isFetching,
    isSuccess,
    isError,
    error,
  } = useGetRolesQuery(undefined, {
    selectFromResult: ({
      data,
      isLoading,
      isFetching,
      isSuccess,
      isError,
      error,
    }) => ({ data, isLoading, isFetching, isSuccess, isError, error }),
  });

  return (
    users &&
    appRoles && (
      <DataTable
        data={users}
        columns={columns}
        metaData={{
          roles: appRoles,
          refetchUsers,
        }}
        columnSearch={{
          columnId: 'user_details',
          placeholder: 'Filter users...',
        }}
        filters={[
          {
            column: 'status',
            title: 'Status',
            options: [
              {
                value: 'Disabled',
                label: 'Disabled',
              },
              {
                value: 'Enabled',
                label: 'Enabled',
              },
            ],
          },
        ]}
      />
    )
  );
}
