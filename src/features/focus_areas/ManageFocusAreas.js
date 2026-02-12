import React, { useState } from 'react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { createColumnHelper } from '@tanstack/react-table';
import { enqueueSnackbar } from 'notistack';
import { Pencil, Trash2, Plus } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import {
  useGetAllFocusAreasQuery,
  useDeleteFocusAreaMutation,
} from './focusAreaApiSlice';
import { DataTable } from 'components/DataTable';
import { FocusAreaForm } from './FocusAreaForm';
import { FocusAreaCard } from './FocusAreaCard';
import { ConfirmDeleteDialog } from 'components/ConfirmDeleteDialog';
import { ResponsiveFormModal } from 'components/ResponsiveFormModal';
import { Button } from 'ui/button';
import { Skeleton } from 'ui/skeleton';

const columnHelper = createColumnHelper();

const getColumns = ({ onEdit, onDelete, isAdmin }) => [
  columnHelper.accessor('name', {
    header: () => 'Name',
    cell: ({ getValue }) => <span className='font-medium'>{getValue()}</span>,
  }),
  columnHelper.accessor('description', {
    header: () => 'Description',
    cell: ({ getValue }) => (
      <span className='line-clamp-2 max-w-[300px]'>{getValue() || '-'}</span>
    ),
  }),
  columnHelper.accessor('state_goal', {
    header: () => 'State Goal',
    cell: ({ getValue }) => (
      <span className='line-clamp-2 max-w-[250px]'>{getValue() || '-'}</span>
    ),
  }),
  columnHelper.display({
    id: 'policy_count',
    header: () => 'Policies',
    cell: ({ row }) => row.original.policies?.length ?? 0,
  }),
  columnHelper.display({
    id: 'actions',
    header: () => '',
    cell: ({ row }) => (
      <div className='flex gap-1 justify-end'>
        {isAdmin && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onEdit(row.original)}
            aria-label='Edit focus area'
          >
            <Pencil className='h-4 w-4' />
          </Button>
        )}
        {isAdmin && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onDelete(row.original)}
            aria-label='Delete focus area'
            className='text-red-600 hover:text-red-700'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>
    ),
  }),
];

export const ManageFocusAreas = () => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  const user = useAuth();
  const { isAdmin } = user;

  const { data, isLoading, isSuccess } = useGetAllFocusAreasQuery({
    policies: 'true',
  });
  const [deleteFocusArea, { isLoading: isDeleting }] =
    useDeleteFocusAreaMutation();

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
      await deleteFocusArea(deleteTarget.id).unwrap();
      enqueueSnackbar('Focus area deleted', { variant: 'success' });
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
  });

  if (isLoading) {
    return <Skeleton className='w-full h-[400px]' />;
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h1 className='text-2xl font-semibold tracking-tight'>
          Manage Focus Areas
        </h1>
        {isAdmin && (
          <Button onClick={handleCreate}>
            <Plus className='h-4 w-4 mr-2' />
            Create Focus Area
          </Button>
        )}
      </div>

      {isSuccess && data && (
        <>
          {isSmallDevice ? (
            <div className='grid grid-cols-1 gap-4'>
              {data.map((fa) => (
                <FocusAreaCard
                  key={fa.id}
                  focusArea={fa}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  canEdit={isAdmin}
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
                placeholder: 'Search focus areas...',
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
        title={editingItem ? 'Edit Focus Area' : 'Create Focus Area'}
        description={
          editingItem ? `Editing "${editingItem.name}"` : 'Add a new focus area'
        }
      >
        <FocusAreaForm
          focusArea={editingItem}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </ResponsiveFormModal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title='Delete Focus Area'
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This may affect associated policies and strategies.`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
