import { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from 'ui/avatar';
import { UserCircleIcon } from '@heroicons/react/20/solid';
import { ref } from 'process';

export const UserAvatar = ({ user, ...props }) => {
  const { id = null, given_name = '', family_name = '', profile_pic } = user;
  /*
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef();

  

  useEffect(() => {
    if (profile_pic && imgRef.current && imgRef.current.complete) {
      setLoaded(true);
    }

  }, [imgRef, profile_pic, loaded]);
  */

  if (!id || !(given_name && family_name)) {
    return <UserCircleIcon {...props} />;
  } else {
    console.log('profile pic:', profile_pic);
    /*
{
          loaded == false 
            ? <AvatarFallback>{`${given_name[0]}${family_name[0]}`}</AvatarFallback>
            : <AvatarImage 
                ref={imgRef} 
                src={profile_pic} 
                referrerPolicy="no-referrer" 
                onLoad={()=>setIsLoading(true)} 
                onError={e => console.log(e)}
              />
        }
    */
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
