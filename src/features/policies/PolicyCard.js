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

export const PolicyCard = ({
  policy,
  onEdit,
  onDelete,
  canEdit,
  canDelete,
}) => {
  const { description, policy_number, area } = policy;

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
                  <DropdownMenuItem onSelect={() => onEdit(policy)}>
                    <Pencil className='h-4 w-4 mr-2' />
                    Edit
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onSelect={() => onDelete(policy)}
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
        <div className='flex items-center justify-between'>
          {area && (
            <span className='text-sm text-muted-foreground'>{area.name}</span>
          )}
          <Badge variant='outline' className='text-sm font-mono'>
            #{policy_number}
          </Badge>
        </div>
        <CardTitle className='text-base line-clamp-2'>{description}</CardTitle>
      </CardHeader>
    </Card>
  );
};
