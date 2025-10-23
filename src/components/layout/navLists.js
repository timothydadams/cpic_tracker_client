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
  {
    label: 'Share Feedback',
    path: 'share-feedback',
    requiresUser: false,
    icon: <LightBulbIcon />,
    id: uuidv4(),
  },
  {
    label: 'divider',
    id: uuidv4(),
  },
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
    path: 'login',
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
];
