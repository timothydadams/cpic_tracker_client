import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  GoalIcon,
  MapIcon,
  LayoutDashboardIcon,
  TargetIcon,
  CalendarClockIcon,
  UsersIcon,
} from 'lucide-react';
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
import {
  SidebarLayout,
  useCloseMobileSidebar,
} from 'catalyst/sidebar-layout.jsx';
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

import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useSendLogoutMutation } from '../../features/auth/authApiSlice.js';
//import useAuth from 'hooks/useAuth.js';
import { userNavItems, adminNavItems } from './navLists.js';
import { DarkModeToggle } from './DarkModeToggle.js';
import useTheme from 'hooks/useTheme.js';
import { ModalFromMarkdown } from './NavItemModelWithMd.js';
import { UserAvatar } from './UserAvatar.js';
import { ModalNavItem } from './ModalForm.js';
import { selectMemoizedUser } from 'features/auth/authSlice.js';
import useHydrateUser from 'hooks/useHydrateUser.js';
//import { selectCurrentRoles } from 'features/auth/authSlice.js';

const SidebarDropdownLink = ({ href, children }) => {
  const closeSidebar = useCloseMobileSidebar();
  return (
    <DropdownItem href={href} onClick={closeSidebar}>
      {children}
    </DropdownItem>
  );
};

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
      {header && <SidebarHeading>{header}</SidebarHeading>}
      {list.map((item) => {
        if (item.Component) {
          return (
            <ModalNavItem
              key={item.id}
              title={item.label}
              Icon={item.icon}
              Component={item.Component}
            />
          );
        } else {
          return (
            <SidebarItem href={item.path} key={item.id}>
              {item.icon && item.icon}
              {item.label && item.label}
            </SidebarItem>
          );
        }
      })}
    </SidebarSection>
  );
};

const NavList = ({ parent, list, ...props }) => {
  const [sendLogout] = useSendLogoutMutation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await sendLogout().unwrap();
    //prevent auto-login if user explicitly logs out
    if (window.PasswordCredentials) {
      navigator.credentials.preventSilentAccess();
    }
    navigate('/');
  };

  return (
    <DropdownMenu {...props}>
      {list.map(({ label, Component, path, icon, id, action = null }) => {
        let content;
        if (label === 'divider') {
          content = <DropdownDivider key={id} />;
        } else if (Component) {
          content = (
            <ModalNavItem
              parent={parent}
              key={id}
              title={label}
              Icon={icon}
              Component={Component}
            />
          );
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
  const user = useSelector(selectMemoizedUser);
  useHydrateUser();
  const location = useLocation();
  const { pathname } = location;

  useEffect(() => {
    if (pathname !== '/login' && !pathname.startsWith('/register')) {
      sessionStorage.setItem(
        'returnTo',
        pathname + location.search + location.hash
      );
    }
  }, [pathname, location.search, location.hash]);

  const { id, roles, isAdmin, isCPICAdmin } = user;

  const isAdminOnly = (item) =>
    item.allowedRoles?.every((r) => r === 'Admin' || r === 'CPIC Admin');
  const adminDropdownItems = adminNav.filter(isAdminOnly);
  const quickActionItems = adminNav.filter((item) => !isAdminOnly(item));

  useEffect(() => {
    if (roles) {
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
    let isAuthedUser = Boolean(id);
    setUserNav([
      ...userNavItems.filter((n) => {
        if (id) {
          return n.path === '/login' ? false : true;
        } else {
          return n.requiresUser === isAuthedUser;
        }
      }),
    ]);

    return () => {};
  }, [id]);

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <NavbarSpacer />
          <NavbarSection>
            <DarkModeToggle theme={theme} setTheme={setTheme} type='navbar' />
            <Dropdown>
              <DropdownButton as={NavbarItem} aria-label='User Menu'>
                <UserAvatar user={user} className='h-6 w-6' />
              </DropdownButton>
              <NavList
                parent='dropdown'
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
                {(isAdmin || isCPICAdmin) && (
                  <SidebarDropdownLink href='/app/settings'>
                    <Cog8ToothIcon />
                    <DropdownLabel>App Settings</DropdownLabel>
                  </SidebarDropdownLink>
                )}
                {(isAdmin || isCPICAdmin) && adminDropdownItems.length > 0 && (
                  <DropdownDivider />
                )}
                {adminDropdownItems.map((item) => (
                  <SidebarDropdownLink key={item.id} href={item.path}>
                    <DropdownLabel>{item.label}</DropdownLabel>
                  </SidebarDropdownLink>
                ))}
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
              <SidebarItem href='/policies' current={pathname === '/policies'}>
                <MapIcon />
                <SidebarLabel>Goals & Policies</SidebarLabel>
              </SidebarItem>

              <SidebarItem
                href='/strategies'
                current={pathname.startsWith('/strategies')}
              >
                <GoalIcon />
                <SidebarLabel>All Strategies</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            <SidebarSection>
              <SidebarHeading>Metrics</SidebarHeading>
              <SidebarItem
                href='/metrics/overview'
                current={pathname.startsWith('/metrics/overview')}
              >
                <LayoutDashboardIcon />
                <SidebarLabel>Overview</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href='/metrics/focus-areas'
                current={pathname.startsWith('/metrics/focus-areas')}
              >
                <TargetIcon />
                <SidebarLabel>Focus Areas</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href='/metrics/timelines'
                current={pathname.startsWith('/metrics/timelines')}
              >
                <CalendarClockIcon />
                <SidebarLabel>Timelines</SidebarLabel>
              </SidebarItem>
              <SidebarItem
                href='/metrics/implementers'
                current={pathname.startsWith('/metrics/implementers')}
              >
                <UsersIcon />
                <SidebarLabel>Implementers</SidebarLabel>
              </SidebarItem>
            </SidebarSection>

            {quickActionItems.length > 0 && (
              <SideBarList
                className=''
                header='Quick Actions'
                list={quickActionItems}
              />
            )}

            <SidebarSpacer />
            <SidebarSection>
              <SidebarItem href='/faq' current={pathname === '/faq'}>
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
