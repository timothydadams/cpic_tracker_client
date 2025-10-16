import React, { useEffect, useState } from 'react';
import { Text } from 'catalyst/text.jsx';
import { Fieldset, Label, Description, Legend } from 'catalyst/fieldset.jsx';
import {
  useGetUserRolesQuery,
  useAddRoleToUserMutation,
  useRemoveRoleFromUserMutation,
} from './usersApiSlice';

import { Checkbox, CheckboxField, CheckboxGroup } from 'catalyst/checkbox';
import { enqueueSnackbar } from 'notistack';
import { Loading } from 'components/Spinners';

export const EditRolesForm = ({ user, availableRoles, refetchUsers }) => {
  const { id, email } = user;
  const [selectedRoles, setSelectedRoles] = useState([]);

  const {
    data: existingRoles,
    isLoading: rolesLoading,
    refetch,
  } = useGetUserRolesQuery(id, {
    skip: !id,
  });

  const [addRole, { isSuccess: addSuccess }] = useAddRoleToUserMutation();
  const [removeRole, { isSuccess: removeSuccess }] =
    useRemoveRoleFromUserMutation();

  useEffect(() => {
    if (existingRoles) {
      setSelectedRoles((prev) => existingRoles);
    }
  }, [existingRoles]);

  const checkIfUserHasRole = (roleId) => {
    const role = selectedRoles.find((r) => r.id === roleId);
    if (role) return true;
    return false;
  };

  const handleRoleChange = async (checked, roleId) => {
    const role = availableRoles.find((r) => r.id == roleId);

    if (checked) {
      setSelectedRoles((prev) => [...prev, role]);
      const res = await addRole({ userId: id, roleId }).unwrap();
      enqueueSnackbar(`${role.name} Role Added`, { variant: 'success' });
    } else {
      setSelectedRoles((prev) => prev.filter((item) => item.id !== roleId));
      const res = await removeRole({ userId: id, roleId }).unwrap();
      enqueueSnackbar(`${role.name} Role Removed`, { variant: 'success' });
    }

    refetch();
    refetchUsers();
  };

  return rolesLoading ? (
    <Loading />
  ) : (
    <>
      <Fieldset>
        <Legend>Modify Roles the user belongs to.</Legend>
        <Text>checked selections indicate existing role memberships.</Text>
        <CheckboxGroup>
          {availableRoles.map((r) => {
            return (
              <CheckboxField key={r.id}>
                <Checkbox
                  name='roles'
                  value={r.id}
                  checked={checkIfUserHasRole(r.id)}
                  onChange={(checked) => handleRoleChange(checked, r.id)}
                />
                <Label>{r.name}</Label>
                <Description>{r.description}</Description>
              </CheckboxField>
            );
          })}
        </CheckboxGroup>
      </Fieldset>
    </>
  );
};
