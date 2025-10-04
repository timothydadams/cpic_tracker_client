import { Avatar } from 'catalyst/avatar';
import {
  Dropdown,
  DropdownButton,
  DropdownDivider,
  DropdownItem,
  DropdownLabel,
  DropdownMenu,
} from 'catalyst/dropdown';
import {
  Navbar,
  NavbarItem,
  NavbarLabel,
  NavbarSection,
  NavbarSpacer,
} from 'catalyst/navbar';
import {
  ChevronDownIcon,
  Cog8ToothIcon,
  PlusIcon,
} from '@heroicons/react/16/solid';
import { InboxIcon, MagnifyingGlassIcon } from '@heroicons/react/20/solid';
//import psTreasureSource from "assets/images/treasure.webp";

export const SkyropNav = () => {
  return (
    <Dropdown>
      <DropdownButton as={NavbarItem} aria-label='Project Skydrop'>
        <Avatar
          slot='icon'
          src='assets/images/treasure.webp'
          initials='PS'
          className='bg-yellow-500 text-black'
        />
        <NavbarLabel>Project Skydrop</NavbarLabel>
        <ChevronDownIcon />
      </DropdownButton>
      <DropdownMenu className='min-w-64' anchor='bottom start'>
        <DropdownItem href='/skydrop'>
          <Cog8ToothIcon />
          <DropdownLabel>Temp & Rain Graph By Station</DropdownLabel>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};
