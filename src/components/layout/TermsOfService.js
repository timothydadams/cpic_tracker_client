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
import {
  QuestionMarkCircleIcon,
  ListBulletIcon,
} from '@heroicons/react/20/solid';

export const TermsOfService = () => {
  let [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SidebarItem
        aria-label='Terms of Service'
        onClick={() => setIsOpen(true)}
      >
        <ListBulletIcon />
        <SidebarLabel>Terms of Service</SidebarLabel>
      </SidebarItem>

      <Dialog open={isOpen} onClose={setIsOpen} size='2xl'>
        <DialogTitle>Terms of Service</DialogTitle>
        <DialogDescription>
          By using this application, you agree to the following terms and
          conditions:
        </DialogDescription>
        <DialogBody className='text-sm/6 text-zinc-900 dark:text-white'>
          <p className='mt-4'>
            By accessing and using our services, you are agreeing to these
            terms, which have been meticulously tailored for our benefit and
            your compliance.
          </p>
          <h3 className='mt-6 font-bold'>Comprehensive Acceptance of Terms</h3>
          <p className='mt-4'>
            Your engagement with our application signifies your irrevocable
            acceptance of these terms, which are binding regardless of your
            awareness or understanding of them. Your continued use acts as a
            silent nod of agreement to any and all stipulations outlined herein.
          </p>
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
