import React from 'react';
import { Button } from 'catalyst/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTrigger,
  DialogDescription,
  DialogTitle,
} from 'catalyst/dialog';
import { DropdownItem } from 'catalyst/dropdown';
import { SidebarItem, SidebarLabel } from 'catalyst/sidebar.jsx';
import { XIcon } from 'lucide-react';

export const ModalNavItem = ({
  parent = 'sidebar',
  title,
  Icon,
  Component,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOpen = (e) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      {parent === 'sidebar' ? (
        <SidebarItem aria-label={title} onClick={handleOpen}>
          {Icon}
          <SidebarLabel>{title}</SidebarLabel>
        </SidebarItem>
      ) : (
        <DropdownItem onClick={handleOpen}>
          {Icon}
          {title}
        </DropdownItem>
      )}

      <Dialog open={isOpen} onClose={setIsOpen} size='2xl' className='p-2'>
        <div className='w-full relative'>
          <div className='absolute top-0 right-0'>
            <Button plain onClick={() => setIsOpen(false)}>
              <XIcon />
            </Button>
          </div>
        </div>
        <DialogBody>
          <Component />
        </DialogBody>
        <DialogActions>
          {/* <Button onClick={() => setIsOpen(false)}>Close</Button> */}
        </DialogActions>
      </Dialog>
    </>
  );
};
