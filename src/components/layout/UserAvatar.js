import { Avatar, AvatarFallback, AvatarImage } from 'ui/avatar';
import { UserCircleIcon } from '@heroicons/react/20/solid';

export const UserAvatar = ({ user, ...props }) => {
  const { id = null, given_name = '', family_name = '', profile_pic } = user;
  if (!id || !(given_name && family_name)) {
    return <UserCircleIcon {...props} />;
  } else {
    return (
      <Avatar {...props}>
        <AvatarImage src={profile_pic} />
        <AvatarFallback>{`${given_name[0]}${family_name[0]}`}</AvatarFallback>
      </Avatar>
    );
  }
};
