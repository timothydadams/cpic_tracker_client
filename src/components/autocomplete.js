import * as React from 'react';
import { cn } from 'utils/cn.js';
import { Command as CommandPrimitive } from 'cmdk';
import { Check } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from './ui/command';
import { Input } from './ui/input';
import { Popover, PopoverAnchor, PopoverContent } from './ui/popover';
import { Skeleton } from './ui/skeleton';

export const Autocomplete = ({
  selectedValue,
  onSelectedValueChange,
  searchValue,
  onSearchValueChange,
  items,
  isLoading,
  shouldFilter = true,
  emptyMessage = 'No items.',
  placeholder = 'Search...',
}) => {
  const [open, setOpen] = React.useState(false);

  const labels = React.useMemo(
    () =>
      items.reduce((acc, item) => {
        acc[item.value] = item.label;
        return acc;
      }, {}),
    [items]
  );

  const reset = () => {
    onSelectedValueChange('');
    onSearchValueChange('');
  };

  const onInputBlur = (e) => {
    if (
      !e.relatedTarget?.hasAttribute('cmdk-list') &&
      labels[selectedValue] !== searchValue
    ) {
      reset();
    }
  };

  const onSelectItem = (inputValue) => {
    if (inputValue === selectedValue) {
      reset();
    } else {
      onSelectedValueChange(inputValue);
      onSearchValueChange(labels[inputValue] ?? '');
    }
    setOpen(false);
  };

  return (
    <div className='flex items-center'>
      <Popover open={open} onOpenChange={setOpen}>
        <Command shouldFilter={shouldFilter}>
          <PopoverAnchor asChild>
            <CommandPrimitive.Input
              asChild
              value={searchValue}
              onValueChange={onSearchValueChange}
              onKeyDown={(e) => setOpen(e.key !== 'Escape')}
              onMouseDown={() => setOpen((open) => !!searchValue || !open)}
              onFocus={() => setOpen(true)}
              onBlur={onInputBlur}
            >
              <Input placeholder={placeholder} />
            </CommandPrimitive.Input>
          </PopoverAnchor>
          {!open && <CommandList aria-hidden='true' className='hidden' />}
          <PopoverContent
            asChild
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={(e) => {
              if (
                e.target instanceof Element &&
                e.target.hasAttribute('cmdk-input')
              ) {
                e.preventDefault();
              }
            }}
            className='w-[--radix-popover-trigger-width] p-0'
          >
            <CommandList>
              {isLoading && (
                <CommandPrimitive.Loading>
                  <div className='p-1'>
                    <Skeleton className='h-6 w-full' />
                  </div>
                </CommandPrimitive.Loading>
              )}
              {items.length > 0 && !isLoading ? (
                <CommandGroup>
                  {items.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onMouseDown={(e) => e.preventDefault()}
                      onSelect={onSelectItem}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4',
                          selectedValue === option.value
                            ? 'opacity-100'
                            : 'opacity-0'
                        )}
                      />
                      {option.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : null}
              {!isLoading ? (
                <CommandEmpty>{emptyMessage ?? 'No items.'}</CommandEmpty>
              ) : null}
            </CommandList>
          </PopoverContent>
        </Command>
      </Popover>
    </div>
  );
};
