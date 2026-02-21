import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUserId, setUserProfile } from 'features/auth/authSlice';
import { useGetUserQuery } from 'features/users/usersApiSlice';

const useHydrateUser = () => {
  const dispatch = useDispatch();
  const userId = useSelector(selectCurrentUserId);

  const { data } = useGetUserQuery(
    { id: userId },
    {
      skip: !userId,
      selectFromResult: ({ data }) => ({ data }),
    }
  );

  useEffect(() => {
    if (data) {
      const { given_name, family_name, display_name, email, profile_pic } =
        data;
      dispatch(
        setUserProfile({
          given_name,
          family_name,
          display_name,
          email,
          profile_pic,
        })
      );
    }
  }, [data, dispatch]);
};

export default useHydrateUser;
