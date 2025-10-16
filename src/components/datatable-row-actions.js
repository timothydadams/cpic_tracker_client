import { Row } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from 'ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';

//import { labels } from "../data/data"

import { z } from 'zod';

const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: z.string(),
  label: z.string(),
  priority: z.string(),
});

export function DataTableRowActions({ row }) {
  const data = row.original;
  const task = taskSchema.parse(row.original);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='data-[state=open]:bg-muted size-8'
        >
          <MoreHorizontal />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(data)}>
          Copy Strategy Data
        </DropdownMenuItem>
        <DropdownMenuItem>Favorite</DropdownMenuItem>
        {/*
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup value={task.label}>
              {labels.map((label) => (
                <DropdownMenuRadioItem key={label.value} value={label.value}>
                  {label.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        */}

        <DropdownMenuItem variant='destructive'>
          Delete
          <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
