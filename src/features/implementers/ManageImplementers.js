import React, { useState } from 'react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { createColumnHelper } from '@tanstack/react-table';
import { enqueueSnackbar } from 'notistack';
import { Pencil, Trash2, Plus } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import {
  useGetAllImplementersQuery,
  useDeleteImplementerMutation,
} from './implementersApiSlice';
import { DataTable } from 'components/DataTable';
import { ImplementerForm } from './ImplementerForm';
import { ImplementerCard } from './ImplementerCard';
import { ConfirmDeleteDialog } from 'components/ConfirmDeleteDialog';
import { ResponsiveFormModal } from 'components/ResponsiveFormModal';
import { Button } from 'ui/button';
import { Badge } from 'ui/badge';
import { Skeleton } from 'ui/skeleton';

const columnHelper = createColumnHelper();

const getColumns = ({ onEdit, onDelete, isAdmin, isCPICAdmin }) => [
  columnHelper.accessor('name', {
    header: () => 'Name',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
  }),
  columnHelper.display({
    id: 'emails',
    header: () => 'Emails',
    cell: ({ row }) => {
      const emails = row.original.emails;
      if (!emails?.length) return '-';
      return (
        <span className='max-w-[200px] truncate block'>
          {emails.join(', ')}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'phone_numbers',
    header: () => 'Phone',
    cell: ({ row }) => {
      const phones = row.original.phone_numbers;
      if (!phones?.length) return '-';
      return (
        <span className='max-w-[150px] truncate block'>
          {phones.join(', ')}
        </span>
      );
    },
  }),
  columnHelper.display({
    id: 'type',
    header: () => 'Type',
    cell: ({ row }) => {
      const { is_board, is_department, is_school } = row.original;
      return (
        <div className='flex flex-wrap gap-1'>
          {is_board && <Badge variant='secondary'>Board</Badge>}
          {is_department && <Badge variant='secondary'>Dept</Badge>}
          {is_school && <Badge variant='secondary'>School</Badge>}
          {!is_board && !is_department && !is_school && (
            <Badge variant='outline'>Other</Badge>
          )}
        </div>
      );
    },
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <div className='flex gap-1 justify-end'>
        {(isAdmin || isCPICAdmin) && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onEdit(row.original)}
            aria-label='Edit implementer'
          >
            <Pencil className='h-4 w-4' />
          </Button>
        )}
        {isAdmin && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onDelete(row.original)}
            aria-label='Delete implementer'
            className='text-red-600 hover:text-red-700'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>
    ),
  }),
];

export const ManageImplementers = () => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  const user = useAuth();
  const { isAdmin, isCPICAdmin } = user;
  const canEdit = isAdmin || isCPICAdmin;

  const { data, isLoading, isSuccess } = useGetAllImplementersQuery(
    { params: {} },
    {
      selectFromResult: ({ data, isLoading, isSuccess }) => ({
        data,
        isLoading,
        isSuccess,
      }),
    }
  );
  const [deleteImplementer, { isLoading: isDeleting }] =
    useDeleteImplementerMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setFormOpen(true);
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async () => {
    try {
      await deleteImplementer(deleteTarget.id).unwrap();
      enqueueSnackbar('Implementer deleted', { variant: 'success' });
      setDeleteTarget(null);
    } catch (err) {
      enqueueSnackbar(`Failed to delete: ${err?.data?.message || err}`, {
        variant: 'error',
      });
    }
  };

  const columns = getColumns({
    onEdit: handleEdit,
    onDelete: setDeleteTarget,
    isAdmin,
    isCPICAdmin,
  });

  if (isLoading) {
    return <Skeleton className='w-full h-[400px]' />;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Manage Implementers
        </h1>
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className='h-4 w-4 mr-2' />
            Create Implementer
          </Button>
        )}
      </div>

      {isSuccess && data && (
        <>
          {isSmallDevice ? (
            <div className='grid grid-cols-1 gap-4'>
              {data.map((impl) => (
                <ImplementerCard
                  key={impl.id}
                  implementer={impl}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  canEdit={canEdit}
                  canDelete={isAdmin}
                />
              ))}
            </div>
          ) : (
            <DataTable
              data={data}
              columns={columns}
              columnSearch={{
                id: 'name',
                placeholder: 'Search implementers...',
              }}
            />
          )}
        </>
      )}

      <ResponsiveFormModal
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) handleFormClose();
        }}
        title={editingItem ? 'Edit Implementer' : 'Create Implementer'}
        description={
          editingItem
            ? `Editing "${editingItem.name}"`
            : 'Add a new implementer organization'
        }
      >
        <ImplementerForm
          implementer={editingItem}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </ResponsiveFormModal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title='Delete Implementer'
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This may affect strategies assigned to this implementer.`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
