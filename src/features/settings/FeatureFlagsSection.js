import React from 'react';
import { enqueueSnackbar } from 'notistack';
import {
  useGetFeatureFlagsQuery,
  useUpdateFeatureFlagMutation,
} from './settingsApiSlice';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from 'ui/card';
import { SwitchField, SwitchGroup, Switch } from 'catalyst/switch';
import { Label, Description } from 'catalyst/fieldset';
import { Dots } from 'components/Spinners';

const FLAG_META = {
  deadline_scheduler: {
    label: 'Deadline Scheduler',
    description: 'Master switch for the daily deadline check cron job',
  },
  deadline_reminders: {
    label: 'Deadline Reminders',
    description: 'Upcoming deadline and day-of reminder emails',
  },
  overdue_notifications: {
    label: 'Overdue Notifications',
    description: 'Overdue strategy notification emails',
  },
};

export const FeatureFlagsSection = () => {
  const { data: flags, isLoading } = useGetFeatureFlagsQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });
  const [updateFlag] = useUpdateFeatureFlagMutation();

  const handleToggle = async (key, currentEnabled) => {
    try {
      await updateFlag({ key, enabled: !currentEnabled }).unwrap();
      enqueueSnackbar(
        `${FLAG_META[key]?.label || key} ${!currentEnabled ? 'enabled' : 'disabled'}`,
        { variant: 'success' }
      );
    } catch (err) {
      enqueueSnackbar(err?.data?.message || 'Failed to update feature flag', {
        variant: 'error',
      });
    }
  };

  if (isLoading) return <Dots />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Feature Flags</CardTitle>
        <CardDescription>
          Control which automated email notifications are active. Invite emails
          are always enabled and bypass these flags.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SwitchGroup>
          {flags?.map((flag) => {
            const meta = FLAG_META[flag.key] || {
              label: flag.key,
              description: flag.description,
            };
            return (
              <SwitchField key={flag.key}>
                <Label>{meta.label}</Label>
                <Description>{meta.description}</Description>
                <Switch
                  checked={flag.enabled}
                  onChange={() => handleToggle(flag.key, flag.enabled)}
                  color={flag.enabled ? 'emerald' : 'dark/zinc'}
                />
              </SwitchField>
            );
          })}
        </SwitchGroup>
      </CardContent>
    </Card>
  );
};
