import * as React from 'react';
import { Button } from 'ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from 'ui/field';

import { RelativeTimeCard } from 'ui/relative-time-card';

export const FormWrapper = ({
  strategyDetails,
  formId,
  form,
  children,
  ...props
}) => {
  const { strategy_number, policy, updatedAt, createdAt } = strategyDetails;

  const uDate = new Date(updatedAt);
  const cDate = new Date(createdAt);

  const title = `Edit Strategy ${policy.policy_number}.${strategy_number}`;
  const description = policy.area.name;

  return (
    <Card {...props}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>
          <div className='flex justify-between'>
            <div>{description}</div>
            <div>
              <p>
                Updated:{' '}
                {updatedAt ? (
                  <RelativeTimeCard date={uDate} side='left'>
                    {uDate.toLocaleDateString()}
                  </RelativeTimeCard>
                ) : (
                  'N/A'
                )}
              </p>
            </div>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {form && formId && (
        <CardFooter>
          <Field orientation='horizontal'>
            <Button
              type='button'
              variant='outline'
              onClick={() =>
                form.reset({ ...strategyDetails }, { triggerWatch: false })
              }
            >
              Reset
            </Button>
            <Button type='submit' form={formId}>
              Save
            </Button>
          </Field>
        </CardFooter>
      )}
    </Card>
  );
};
