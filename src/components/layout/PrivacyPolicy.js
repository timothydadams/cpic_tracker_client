import React from 'react';
import { Button } from 'catalyst/button';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from 'catalyst/dialog';
import { useState } from 'react';
import { SidebarItem, SidebarLabel } from 'catalyst/sidebar.jsx';
import { ShieldCheckIcon } from '@heroicons/react/20/solid';

export const PrivacyPolicy = () => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SidebarItem aria-label='Privacy Policy' onClick={() => setIsOpen(true)}>
        <ShieldCheckIcon />
        <SidebarLabel>Privacy Policy</SidebarLabel>
      </SidebarItem>

      <Dialog open={isOpen} onClose={setIsOpen} size='2xl'>
        <DialogTitle>Privacy Policy</DialogTitle>
        <DialogDescription>
          We do our best to protect your data, but there are real assholes out
          there always trying to steal our stuff.
        </DialogDescription>
        <DialogBody className='text-sm/6 text-zinc-900 dark:text-white'>
          <p className='mt-4'>
            We won't sell your personal information to third parties
          </p>
          <h3 className='mt-6 font-bold'>Comprehensive Acceptance of Terms</h3>
          {/* ... */}
        </DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => setIsOpen(false)}>I agree</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
