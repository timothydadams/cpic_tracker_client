import { Avatar } from '../../components/catalyst/avatar.jsx';
import { UserCircleIcon } from '@heroicons/react/20/solid';

export const UserAvatar = ({ user, ...props }) => {
  if (!user || user?.id == null || !(user?.given_name && user?.family_name)) {
    return <UserCircleIcon {...props} />;
  } else {
    const { profile_pic = null, given_name = '', family_name = '' } = user;
    //console.log(user);
    return (
      <Avatar
        src={profile_pic}
        initials={`${given_name[0]}${family_name[0]}`}
        {...props}
      />
    );
  }
};
