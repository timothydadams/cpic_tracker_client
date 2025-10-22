import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';
import useTheme from 'hooks/useTheme.js';
import { NavbarItem } from 'catalyst/navbar.jsx';
import { SidebarItem, SidebarLabel } from 'catalyst/sidebar.jsx';
import { NavbarSection } from '../catalyst/navbar';

export const DarkModeToggle = ({ theme, setTheme, type = 'sidebar' }) => {
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  let icon = theme === 'light' ? <MoonIcon /> : <SunIcon />;

  let content;

  if (type === 'navbar') {
    content = (
      <NavbarSection>
        <NavbarItem
          onClick={toggleTheme}
          className='will-change-transform appearance-none [-webkit-appearance:none]'
          aria-label='Toggle Dark Mode'
        >
          {icon}
        </NavbarItem>
      </NavbarSection>
    );
  } else {
    content = (
      <SidebarItem aria-label='Toggle Dark Mode' onClick={toggleTheme}>
        {icon}
        <SidebarLabel>
          {theme === 'dark' ? 'Toggle Light Mode' : 'Toggle Dark Mode'}
        </SidebarLabel>
      </SidebarItem>
    );
  }

  return content;
};
