import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from 'ui/card';
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

export const FocusAreaCard = ({
  focusArea,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => {
  const { name, description, state_goal, policies } = focusArea;
  const policyCount = policies?.length ?? 0;

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
                  <DropdownMenuItem onSelect={() => onEdit(focusArea)}>
                    <Pencil className='h-4 w-4 mr-2' />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => onDelete(focusArea)}
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
        <CardDescription className='line-clamp-2'>
          {description || 'No description'}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-2'>
        {state_goal && (
          <p className='text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2'>
            {state_goal}
          </p>
        )}
        <div className='flex gap-2'>
          <Badge variant='secondary'>
            {policyCount} {policyCount === 1 ? 'policy' : 'policies'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};
