import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, X } from 'lucide-react';

import { cn } from 'utils/cn.js';
import { Button } from 'ui/button';
import { Calendar } from 'ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from 'ui/popover';

const DatePicker = React.forwardRef(
  (
    {
      selected,
      onSelect,
      disabled = false,
      placeholder = 'Pick a date',
      clearable = false,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleSelect = (date) => {
      onSelect?.(date ?? null);
      setOpen(false);
    };

    const handleClear = (e) => {
      e.stopPropagation();
      onSelect?.(null);
    };

    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            id={id}
            variant='outline'
            disabled={disabled}
            className={cn(
              'w-[200px] justify-start text-left font-normal',
              !selected && 'text-muted-foreground',
              className
            )}
          >
            <CalendarIcon className='mr-2 h-4 w-4' />
            {selected ? (
              format(selected, 'MMM d, yyyy')
            ) : (
              <span>{placeholder}</span>
            )}
            {clearable && selected && !disabled && (
              <X
                className='ml-auto h-4 w-4 opacity-50 hover:opacity-100'
                onClick={handleClear}
              />
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-auto p-0' align='start'>
          <Calendar
            mode='single'
            selected={selected}
            onSelect={handleSelect}
            captionLayout='dropdown'
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2040, 11)}
            autoFocus
            {...props}
          />
        </PopoverContent>
      </Popover>
    );
  }
);
DatePicker.displayName = 'DatePicker';

export { DatePicker };
