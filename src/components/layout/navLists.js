import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/16/solid';
import {
  Cog6ToothIcon,
  HomeIcon,
  InboxIcon,
  MagnifyingGlassIcon,
  MegaphoneIcon,
  QuestionMarkCircleIcon,
  SparklesIcon,
  Square2StackIcon,
  TicketIcon,
  UserCircleIcon,
} from '@heroicons/react/20/solid';

import { InviteUsers } from '../../features/users/InviteUserForm';
import { CreateCodeForm } from '../../features/invites/CreateCodeForm';
import { AssignedStrategies } from '../../features/strategies/AssignedStrategies';

export const userNavItems = [
  {
    label: 'My profile',
    path: 'profile',
    requiresUser: true,
    icon: <UserIcon />,
    id: uuidv4(),
  },
  {
    label: 'divider',
    id: uuidv4(),
  },
  /*
  {
    label: 'Share Feedback',
    Component: (props) => <div>Future Form</div>,
    requiresUser: false,
    icon: <LightBulbIcon />,
    id: uuidv4(),
  },
  
  {
    label: 'divider',
    id: uuidv4(),
  },
  */
  {
    label: 'Sign Out',
    path: null,
    action: 'logout',
    requiresUser: true,
    icon: <ArrowRightStartOnRectangleIcon />,
    id: uuidv4(),
  },
  {
    label: 'Sign In',
    path: '/login',
    requiresUser: false,
    icon: <UserIcon />,
    id: uuidv4(),
  },
];

export const adminNavItems = [
  {
    label: 'Manage Assigned Roles',
    path: 'admin/users',
    allowedRoles: ['Admin'],
    id: uuidv4(),
  },
  {
    label: 'Manage Strategies',
    path: 'strategies',
    allowedRoles: ['Admin', 'CPIC Admin'],
    id: uuidv4(),
  },
  {
    label: 'Invite Users',
    Component: () => <CreateCodeForm />,
    allowedRoles: ['Admin', 'CPIC Admin', 'CPIC Member', 'Implementer'],
    id: uuidv4(),
  },
  {
    label: 'My Strategies',
    path: 'my-strategies',
    //Component: () => <AssignedStrategies />,
    allowedRoles: ['Admin', 'CPIC Admin', 'CPIC Member', 'Implementer'],
    id: uuidv4(),
  },
];
