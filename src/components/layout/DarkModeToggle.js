import React from 'react';
import { MoonIcon, SunIcon } from '@heroicons/react/20/solid';

import { NavbarItem } from 'catalyst/navbar.jsx';
import { SidebarItem, SidebarLabel } from 'catalyst/sidebar.jsx';

export const DarkModeToggle = ({ theme, action, type = 'button' }) => {
  const toggleTheme = () => {
    action((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const btnAction = type === 'button' ? true : false;

  let icon =
    theme === 'light' ? (
      <MoonIcon onClick={btnAction === true ? toggleTheme : null} />
    ) : (
      <SunIcon onClick={btnAction === true ? toggleTheme : null} />
    );

  let content;

  if (type === 'button') {
    content = <NavbarItem aria-label='Toggle Dark Mode'>{icon}</NavbarItem>;
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
