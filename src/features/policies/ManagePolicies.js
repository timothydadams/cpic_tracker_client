import React, { useState } from 'react';
import { useMediaQuery } from '@uidotdev/usehooks';
import { createColumnHelper } from '@tanstack/react-table';
import { enqueueSnackbar } from 'notistack';
import { Pencil, Trash2, Plus } from 'lucide-react';
import useAuth from 'hooks/useAuth';
import {
  useGetAllPoliciesQuery,
  useDeletePolicyMutation,
} from './policiesApiSlice';
import { DataTable } from 'components/DataTable';
import { PolicyForm } from './PolicyForm';
import { PolicyCard } from './PolicyCard';
import { ConfirmDeleteDialog } from 'components/ConfirmDeleteDialog';
import { ResponsiveFormModal } from 'components/ResponsiveFormModal';
import { Button } from 'ui/button';
import { Skeleton } from 'ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

const columnHelper = createColumnHelper();

const getColumns = ({ onEdit, onDelete, isAdmin, isCPICAdmin }) => [
  columnHelper.accessor((row) => row.area?.name ?? '', {
    id: 'focus_area',
    header: () => 'Focus Area',
    cell: ({ getValue }) => getValue() || '-',
  }),
  columnHelper.accessor('policy_number', {
    header: () => '#',
    cell: ({ getValue }) => (
      <span className='font-mono font-medium'>{getValue()}</span>
    ),
  }),
  columnHelper.accessor('description', {
    header: () => 'Description',
    cell: ({ getValue }) => (
      <span className='line-clamp-2 max-w-[400px]'>{getValue()}</span>
    ),
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
            aria-label='Edit policy'
          >
            <Pencil className='h-4 w-4' />
          </Button>
        )}
        {isAdmin && (
          <Button
            variant='ghost'
            size='icon'
            onClick={() => onDelete(row.original)}
            aria-label='Delete policy'
            className='text-red-600 hover:text-red-700'
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        )}
      </div>
    ),
  }),
];

export const ManagePolicies = () => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');
  const user = useAuth();
  const { isAdmin, isCPICAdmin } = user;
  const canEdit = isAdmin || isCPICAdmin;

  const { data, isLoading, isSuccess } = useGetAllPoliciesQuery({
    area: 'true',
  });
  const [deletePolicy, { isLoading: isDeleting }] = useDeletePolicyMutation();

  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [focusAreaFilter, setFocusAreaFilter] = useState('all');

  const focusAreaOptions = React.useMemo(() => {
    if (!data) return [];
    const unique = new Map();
    data.forEach((p) => {
      if (p.area && !unique.has(p.area.id)) {
        unique.set(p.area.id, p.area.name);
      }
    });
    return [...unique.entries()]
      .map(([id, name]) => ({ id: String(id), name }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data]);

  const filteredData = React.useMemo(() => {
    if (!data) return [];
    const filtered =
      focusAreaFilter === 'all'
        ? data
        : data.filter((p) => String(p.area?.id) === focusAreaFilter);
    return [...filtered].sort(
      (a, b) =>
        (a.area?.name ?? '').localeCompare(b.area?.name ?? '') ||
        a.policy_number - b.policy_number
    );
  }, [data, focusAreaFilter]);

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
      await deletePolicy(deleteTarget.id).unwrap();
      enqueueSnackbar('Policy deleted', { variant: 'success' });
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
          Manage Policies
        </h1>
        {canEdit && (
          <Button onClick={handleCreate}>
            <Plus className='h-4 w-4 mr-2' />
            Create Policy
          </Button>
        )}
      </div>

      {isSuccess && data && (
        <>
          <Select value={focusAreaFilter} onValueChange={setFocusAreaFilter}>
            <SelectTrigger className='w-full sm:w-[250px]'>
              <SelectValue placeholder='Filter by focus area' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Focus Areas</SelectItem>
              {focusAreaOptions.map((fa) => (
                <SelectItem key={fa.id} value={fa.id}>
                  {fa.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {isSmallDevice ? (
            <div className='grid grid-cols-1 gap-4'>
              {filteredData.map((policy) => (
                <PolicyCard
                  key={policy.id}
                  policy={policy}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  canEdit={canEdit}
                  canDelete={isAdmin}
                />
              ))}
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
              columnSearch={{
                id: 'description',
                placeholder: 'Search policies...',
              }}
              initialState={{
                sorting: [
                  { id: 'focus_area', desc: false },
                  { id: 'policy_number', desc: false },
                ],
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
        title={editingItem ? 'Edit Policy' : 'Create Policy'}
        description={
          editingItem
            ? `Editing policy #${editingItem.policy_number}`
            : 'Add a new policy'
        }
      >
        <PolicyForm
          policy={editingItem}
          onSuccess={handleFormClose}
          onCancel={handleFormClose}
        />
      </ResponsiveFormModal>

      <ConfirmDeleteDialog
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title='Delete Policy'
        description={`Are you sure you want to delete policy #${deleteTarget?.policy_number}? This may affect associated strategies.`}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};
