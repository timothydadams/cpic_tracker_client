//import { Avatar } from 'catalyst/avatar.jsx';
import { Avatar, AvatarFallback, AvatarImage } from 'ui/avatar';
import { UserCircleIcon } from '@heroicons/react/20/solid';

/*

<Avatar
        src={profile_pic}
        initials={`${given_name[0]}${family_name[0]}`}
        {...props}
      />
      


*/

export const UserAvatar = ({ user, ...props }) => {
  if (!user || user?.id == null || !(user?.given_name && user?.family_name)) {
    return <UserCircleIcon {...props} />;
  } else {
    const { profile_pic = null, given_name = '', family_name = '' } = user;
    return (
      <Avatar>
        <AvatarImage src={profile_pic} />
        <AvatarFallback>{`${given_name[0]}${family_name[0]}`}</AvatarFallback>
      </Avatar>
    );
  }
};
