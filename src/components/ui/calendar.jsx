import * as React from 'react';
import { DayPicker, getDefaultClassNames } from 'react-day-picker';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from 'utils/cn.js';
import { buttonVariants } from 'ui/button';

function Calendar({ className, classNames, showOutsideDays = true, ...props }) {
  const defaultClassNames = getDefaultClassNames();

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn('p-3', className)}
      classNames={{
        months: cn('flex flex-col sm:flex-row gap-4', defaultClassNames.months),
        month: cn('flex flex-col gap-4', defaultClassNames.month),
        month_caption: cn(
          'flex justify-center pt-1 relative items-center',
          defaultClassNames.month_caption
        ),
        caption_label: cn(
          'text-sm font-medium',
          props.captionLayout === 'dropdown' ? 'flex items-center gap-1' : ''
        ),
        dropdowns: cn('flex items-center gap-2', defaultClassNames.dropdowns),
        dropdown_root: cn('relative', defaultClassNames.dropdown_root),
        dropdown: cn(
          'absolute inset-0 opacity-0 cursor-pointer',
          defaultClassNames.dropdown
        ),
        nav: cn(
          'flex items-center gap-1 absolute inset-x-0 top-0 justify-between',
          defaultClassNames.nav
        ),
        button_previous: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          defaultClassNames.button_previous
        ),
        button_next: cn(
          buttonVariants({ variant: 'outline' }),
          'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100',
          defaultClassNames.button_next
        ),
        weekdays: cn('flex', defaultClassNames.weekdays),
        weekday: cn(
          'text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]',
          defaultClassNames.weekday
        ),
        week: cn('flex w-full mt-2', defaultClassNames.week),
        day: cn(
          'h-9 w-9 text-center text-sm p-0 relative',
          defaultClassNames.day
        ),
        day_button: cn(
          buttonVariants({ variant: 'ghost' }),
          'h-9 w-9 p-0 font-normal aria-selected:opacity-100'
        ),
        range_end: cn('day-range-end', defaultClassNames.range_end),
        selected: cn(
          'bg-zinc-900 text-zinc-50 hover:bg-zinc-900 hover:text-zinc-50 focus:bg-zinc-900 focus:text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-50 dark:hover:text-zinc-900 dark:focus:bg-zinc-50 dark:focus:text-zinc-900 rounded-md'
        ),
        today: cn(
          'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50 rounded-md',
          defaultClassNames.today
        ),
        outside: cn(
          'text-muted-foreground opacity-50 aria-selected:bg-zinc-100/50 aria-selected:text-muted-foreground aria-selected:opacity-30',
          defaultClassNames.outside
        ),
        disabled: cn(
          'text-muted-foreground opacity-50',
          defaultClassNames.disabled
        ),
        range_middle: cn(
          'aria-selected:bg-zinc-100 aria-selected:text-zinc-900 dark:aria-selected:bg-zinc-800 dark:aria-selected:text-zinc-50',
          defaultClassNames.range_middle
        ),
        hidden: cn('invisible', defaultClassNames.hidden),
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation, ...iconProps }) =>
          orientation === 'left' ? (
            <ChevronLeft className='h-4 w-4' {...iconProps} />
          ) : (
            <ChevronRight className='h-4 w-4' {...iconProps} />
          ),
        ...props.components,
      }}
      {...props}
    />
  );
}
Calendar.displayName = 'Calendar';

export { Calendar };
