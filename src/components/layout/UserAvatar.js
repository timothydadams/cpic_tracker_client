import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from 'ui/avatar';
import { UserCircleIcon } from '@heroicons/react/20/solid';
import { useSelector } from 'react-redux';
import { selectMemoizedUser } from 'features/auth/authSlice';

export const UserAvatar = ({ user, ...props }) => {
  const {
    id = null,
    given_name = '',
    family_name = '',
    profile_pic,
  } = useSelector(selectMemoizedUser);

  if (!id || !(given_name && family_name)) {
    return <UserCircleIcon {...props} />;
  } else {
    return (
      <Avatar key={profile_pic || 'default-avatar-key'} {...props}>
        <AvatarImage
          src={profile_pic}
          referrerPolicy='no-referrer'
          onError={(e) => console.log(e)}
        />
        <AvatarFallback>{`${given_name[0]}${family_name[0]}`}</AvatarFallback>
      </Avatar>
    );
  }
};
