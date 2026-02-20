import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'ui/tabs';
import { Separator } from 'ui/separator';
import { Subheading } from 'catalyst/heading';
import { EmailInviteForm } from './EmailInviteForm';
import { ManualCodeForm } from './ManualCodeForm';
import { ExistingCodeList } from './ExistingCodeList';

export const InviteUsersForm = () => {
  return (
    <div className='w-full space-y-4'>
      <Subheading>Invite Users</Subheading>

      <Tabs defaultValue='email'>
        <TabsList className='w-full'>
          <TabsTrigger value='email' className='flex-1'>
            Send Email
          </TabsTrigger>
          <TabsTrigger value='manual' className='flex-1'>
            Generate Link
          </TabsTrigger>
        </TabsList>
        <TabsContent value='email'>
          <EmailInviteForm />
        </TabsContent>
        <TabsContent value='manual'>
          <ManualCodeForm />
        </TabsContent>
      </Tabs>

      <Separator />

      <Subheading>Active Invite Codes</Subheading>
      <ExistingCodeList />
    </div>
  );
};
