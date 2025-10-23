import React, { useEffect, useState } from 'react';
import { GoalIcon, MapIcon, ChartNoAxesCombinedIcon } from 'lucide-react';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from 'catalyst/dropdown.jsx';
import {
  Navbar,
  NavbarItem,
  NavbarSection,
  NavbarSpacer,
} from 'catalyst/navbar.jsx';
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from 'catalyst/sidebar.jsx';
import { SidebarLayout } from 'catalyst/sidebar-layout.jsx';
import {
  ArrowRightStartOnRectangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Cog8ToothIcon,
  LightBulbIcon,
  PlusIcon,
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
  PaperAirplaneIcon,
  ChatBubbleLeftEllipsisIcon,
  ShieldCheckIcon,
  ListBulletIcon,
} from '@heroicons/react/20/solid';

import {
  ChartBarSquareIcon,
  PresentationChartLineIcon,
} from '@heroicons/react/24/solid';

import { Outlet, useNavigate } from 'react-router-dom';
import { useSendLogoutMutation } from '../../features/auth/authApiSlice.js';
import useAuth from 'hooks/useAuth.js';
import { userNavItems, adminNavItems } from './navLists.js';
import { DarkModeToggle } from './DarkModeToggle.js';
import useTheme from 'hooks/useTheme.js';
import { ModalFromMarkdown } from './NavItemModelWithMd.js';
import { UserAvatar } from './UserAvatar.js';

const ProfileSection = ({ user }) => {
  const { display_name, family_name, given_name, status } = user;

  return (
    <div className='group block shrink-0'>
      <div className='flex items-center'>
        <div>
          <UserAvatar user={user} className='size-10' />
        </div>
        <div className='ml-3'>
          <p className='text-sm font-medium text-gray-700 group-hover:text-gray-900 dark:text-gray-300 dark:group-hover:text-white'>
            {display_name
              ? display_name
              : given_name && family_name
                ? `${given_name} ${family_name}`
                : 'Anonymous'}
          </p>
          <p className='text-xs font-medium text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-300'>
            {status && status}
          </p>
        </div>
      </div>
    </div>
  );
};

const SideBarList = ({ header = null, list, ...props }) => {
  return (
    <SidebarSection {...props}>
      {header && <SidebarHeading>Admin Actions</SidebarHeading>}
      {list.map((item) => {
        return (
          <SidebarItem href={item.path} key={item.id}>
            {item.icon && item.icon}
            {item.label && item.label}
          </SidebarItem>
        );
      })}
    </SidebarSection>
  );
};

const NavList = ({ list, ...props }) => {
  const [sendLogout] = useSendLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await sendLogout().unwrap();
    navigate('/');
  };

  return (
    <DropdownMenu {...props}>
      {list.map(({ label, path, icon, id, action = null }) => {
        let content;
        if (label === 'divider') {
          content = <DropdownDivider key={id} />;
        } else {
          content = (
            <DropdownItem
              href={path}
              key={id}
              onClick={action === 'logout' ? handleLogout : null}
            >
              {icon}
              <DropdownLabel>{label}</DropdownLabel>
            </DropdownItem>
          );
        }
        return content;
      })}
    </DropdownMenu>
  );
};

export const Layout = () => {
  const [theme, setTheme] = useTheme();
  const [userNav, setUserNav] = useState([]);
  const [adminNav, setAdminNav] = useState([]);
  const user = useAuth();
  console.log('user in layout:', user);
  const {
    name,
    given_name,
    family_name,
    display_name,
    nickname,
    profile_pic,
    email,
    id,
    roles,
    status,
    isAdmin,
    isGlobalAdmin,
    isCPICAdmin,
    isCPICMember,
    isImplementer,
  } = user;

  useEffect(() => {
    if (!roles.includes('Viewer')) {
      let items = adminNavItems.filter((u) =>
        roles.some((x) => u.allowedRoles?.includes(x))
      );
      setAdminNav([...items]);
    } else {
      setAdminNav([]);
    }

    return () => {};
  }, [roles]);

  useEffect(() => {
    let activeUser = id === null ? false : true;
    setUserNav([
      ...userNavItems.filter((n) => {
        if (id) {
          return n.path === 'login' ? false : true;
        } else {
          return n.requiresUser === activeUser;
        }
      }),
    ]);

    return () => {};
  }, [id]);

  useEffect(() => {
    console.log('admin items', adminNav);
  }, [adminNav]);

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <DarkModeToggle theme={theme} setTheme={setTheme} type='navbar' />
            <Dropdown>
              <DropdownButton as={NavbarItem}>
                <UserAvatar user={user} className='h-6 w-6' />
              </DropdownButton>
              <NavList
                list={userNav}
                className='min-w-64'
                anchor='bottom end'
              />
            </Dropdown>
          </NavbarSection>
        </Navbar>
      }
      sidebar={
        <Sidebar>
          <SidebarHeader>
            <Dropdown>
              <DropdownButton as={SidebarItem} className='lg:mb-2.5'>
                <PresentationChartLineIcon />
                <SidebarLabel>Winthrop CPIC</SidebarLabel>
                <ChevronDownIcon />
              </DropdownButton>
              <DropdownMenu
                className='min-w-80 lg:min-w-64'
                anchor='bottom start'
              >
                <DropdownItem href='/app/settings' disabled>
                  <Cog8ToothIcon />
                  <DropdownLabel>Settings</DropdownLabel>
                </DropdownItem>
                {/* 
                <DropdownDivider />
                <DropdownItem href='/teams/create'>
                  <PlusIcon />
                  <DropdownLabel>New team&hellip;</DropdownLabel>
                </DropdownItem>
                */}
              </DropdownMenu>
            </Dropdown>
            <SidebarSection className='max-lg:hidden'>
              <DarkModeToggle
                theme={theme}
                setTheme={setTheme}
                type='sidebar'
              />
            </SidebarSection>
          </SidebarHeader>

          <SidebarBody>
            <SidebarSection>
              <SidebarItem href='/strategies'>
                <GoalIcon />
                <SidebarLabel>View Strategies</SidebarLabel>
              </SidebarItem>
              <SidebarItem href='/policies'>
                <MapIcon />
                <SidebarLabel>View Goals & Policies</SidebarLabel>
              </SidebarItem>
              <SidebarItem href='/'>
                <ChartNoAxesCombinedIcon />
                <SidebarLabel>View Metrics</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            {adminNav.length > 0 && (
              <SideBarList
                className=''
                header='Admin Actions'
                list={adminNav}
              />
            )}

            <SidebarSpacer />
            <SidebarSection>
              <SidebarItem href='/faq'>
                <QuestionMarkCircleIcon />
                <SidebarLabel>FAQ</SidebarLabel>
              </SidebarItem>
              <ModalFromMarkdown
                title='Privacy Policy'
                description=''
                Icon={<ShieldCheckIcon />}
                file='privacy'
              />
              <ModalFromMarkdown
                title='Terms Of Service'
                description=''
                Icon={<ListBulletIcon />}
                file='tos'
              />

              <SidebarItem href='/changelog'>
                <SparklesIcon />
                <SidebarLabel>Changelog</SidebarLabel>
              </SidebarItem>
            </SidebarSection>
          </SidebarBody>
          {/* USER PROFILE SECTION HIDDEN ON SMALLER SCREENS */}
          <SidebarFooter className='max-lg:hidden'>
            <Dropdown>
              <DropdownButton as={SidebarItem}>
                <ProfileSection user={user} />
                <ChevronUpIcon />
              </DropdownButton>
              <NavList list={userNav} className='min-w-64' anchor='top start' />
            </Dropdown>
          </SidebarFooter>
        </Sidebar>
      }
    >
      <Outlet />
    </SidebarLayout>
  );
};
