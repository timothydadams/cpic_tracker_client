import React from 'react';
import { useMediaQuery } from '@uidotdev/usehooks';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from 'ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from 'ui/sheet';
import { cn } from 'utils/cn';

export const ResponsiveFormModal = ({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}) => {
  const isSmallDevice = useMediaQuery('only screen and (max-width : 768px)');

  if (isSmallDevice) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side='bottom'
          className={cn('h-[85dvh] flex flex-col overflow-hidden', className)}
        >
          <SheetHeader>
            <SheetTitle>{title}</SheetTitle>
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
          <div className='flex-1 overflow-y-auto py-4'>{children}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn('sm:max-w-lg', className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className='max-h-[70vh] overflow-y-auto'>{children}</div>
      </DialogContent>
    </Dialog>
  );
};
