import { X } from 'lucide-react';
import { Button } from 'ui/button';
import { Input } from 'ui/input';
import { DataTableViewOptions } from 'components/datatable-view-options';

import { DataTableFacetedFilter } from 'components/datatable-faceted-filter';
import useAuth from 'hooks/useAuth';

export function DataTableToolbar({
  table,
  columnSearch = null,
  filters = [],
  addButton = null,
}) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const user = useAuth();
  const { isAdmin, isCPICAdmin, isCPICMember, isImplementer } = user;
  const { columnId, placeholder } = columnSearch;

  const showButton = !!((isAdmin || isCPICAdmin) && addButton);

  return (
    <div className='grid grid-rows-2 gap-2'>
      <div className='flex justify-between gap-2'>
        <DataTableViewOptions table={table} />
        {showButton && <Button size='sm'>Add Strategy</Button>}
      </div>
      <div className='flex flex-1 items-center gap-2 flex-wrap'>
        {columnSearch && (
          <Input
            placeholder={placeholder ? `${placeholder}` : 'Filter records...'}
            value={table.getColumn(columnId)?.getFilterValue() ?? ''}
            onChange={(event) =>
              table.getColumn(columnId)?.setFilterValue(event.target.value)
            }
            className='h-8 w-[150px] lg:w-[250px]'
          />
        )}
        {filters.map(
          ({ column, title, options }, i) =>
            table.getColumn(column) && (
              <DataTableFacetedFilter
                key={i}
                column={table.getColumn(column)}
                title={title}
                options={options}
              />
            )
        )}

        {isFiltered && (
          <Button
            variant='ghost'
            size='sm'
            onClick={() => table.resetColumnFilters()}
          >
            Reset
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}
