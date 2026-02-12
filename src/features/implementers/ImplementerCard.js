import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from 'ui/card';
import { Badge } from 'ui/badge';
import { Button } from 'ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from 'ui/dropdown-menu';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

export const ImplementerCard = ({
  implementer,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => {
  const { name, emails, phone_numbers, is_board, is_department, is_school } =
    implementer;

  return (
    <Card className='relative'>
      <CardHeader className='relative pr-12'>
        {(canEdit || canDelete) && (
          <div className='absolute top-2 right-2'>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant='ghost' className='h-8 w-8 p-0'>
                  <span className='sr-only'>Open menu</span>
                  <MoreVertical className='h-4 w-4' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end'>
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                {canEdit && (
                  <DropdownMenuItem onSelect={() => onEdit(implementer)}>
                    <Pencil className='h-4 w-4 mr-2' />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => onDelete(implementer)}
                      className='text-red-600 focus:text-red-600'
                    >
                      <Trash2 className='h-4 w-4 mr-2' />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
        <CardTitle className='text-base'>{name}</CardTitle>
      </CardHeader>
      <CardContent className='space-y-2'>
        <div className='flex flex-wrap gap-1'>
          {is_board && <Badge variant='secondary'>Board</Badge>}
          {is_department && <Badge variant='secondary'>Department</Badge>}
          {is_school && <Badge variant='secondary'>School</Badge>}
          {!is_board && !is_department && !is_school && (
            <Badge variant='outline'>Other</Badge>
          )}
        </div>
        {emails?.length > 0 && (
          <p className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>
            {emails.join(', ')}
          </p>
        )}
        {phone_numbers?.length > 0 && (
          <p className='text-sm text-zinc-500 dark:text-zinc-400 truncate'>
            {phone_numbers.join(', ')}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
