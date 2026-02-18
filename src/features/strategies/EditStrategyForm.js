import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetStrategyQuery,
  useUpdateStrategyMutation,
} from './strategiesApiSlice';
import { enqueueSnackbar } from 'notistack';
import { useGetAllImplementersQuery } from '../implementers/implementersApiSlice';
import { useForm, Controller, useWatch } from 'react-hook-form';
import { getDirtyValues, recursivelySanitizeObject } from 'utils/rhf_helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from 'ui/button';
import { Separator } from 'ui/separator';
import { DatePicker } from 'ui/date-picker';
import useAuth from 'hooks/useAuth';

import {
  Field,
  FieldDescription,
  FieldContent,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from 'ui/field';

import { Input } from 'ui/input';
import { Textarea } from 'ui/textarea';
import { FormWrapper } from './FormWrapper';

import {
  useGetAllStatusesQuery,
  useGetAllTimelineOptionsQuery,
} from './strategiesApiSlice';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

import { MultiSelect } from 'components/Multiselect';
import { Skeleton } from 'ui/skeleton';

// Role-based field edit permissions
const FIELD_PERMISSIONS = {
  content: ['isAdmin', 'isCPICAdmin', 'isCPICMember'],
  status_id: ['isAdmin', 'isCPICAdmin', 'isCPICMember', 'isImplementer'],
  timeline_id: ['isAdmin', 'isCPICAdmin'],
  implementers: ['isAdmin', 'isCPICAdmin', 'isCPICMember'],
  primary_implementer: ['isAdmin', 'isCPICAdmin', 'isCPICMember'],
  current_deadline: ['isAdmin', 'isCPICAdmin', 'isCPICMember', 'isImplementer'],
  last_comms_date: ['isAdmin', 'isCPICAdmin', 'isCPICMember'],
};

const getDisabledFields = (auth) => {
  const disabled = {};
  for (const [field, allowedRoles] of Object.entries(FIELD_PERMISSIONS)) {
    disabled[field] = !allowedRoles.some((role) => auth[role]);
  }
  return disabled;
};

const schema = yup.object().shape({
  content: yup.string().required('Description is required'),
  status_id: yup.string().required(),
  timeline_id: yup.string().required(),
  implementers: yup.array().min(1),
  primary_implementer: yup.string().nullable().default(''),
  current_deadline: yup.date().nullable().default(null),
  last_comms_date: yup.date().nullable().default(null),
});

const addLabelValue = (item, labelKey, valueKey) => {
  return {
    ...item,
    label: item[labelKey],
    value: item[valueKey],
  };
};

export const TimelineSelector = ({ id, fieldState, ...props }) => {
  const { data: timelineOptions } = useGetAllTimelineOptionsQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });

  return (
    timelineOptions && (
      <Select {...props}>
        <SelectTrigger
          id={id}
          className='w-[180px]'
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder='Select Status' />
        </SelectTrigger>
        <SelectContent>
          {timelineOptions
            .map((s) => addLabelValue(s, 'title', 'id'))
            .map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    )
  );
};

export const StatusSelector = ({ id, fieldState, ...props }) => {
  const { data: statusOptions } = useGetAllStatusesQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });

  return (
    statusOptions && (
      <Select {...props}>
        <SelectTrigger
          id={id}
          className='w-[180px]'
          aria-invalid={fieldState.invalid}
        >
          <SelectValue placeholder='Select Status' />
        </SelectTrigger>
        <SelectContent>
          {statusOptions
            .map((s) => addLabelValue(s, 'title', 'id'))
            .map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
    )
  );
};

export const ImplementerToggle = ({ fieldState, options, ...props }) => {
  return (
    options && (
      <>
        <MultiSelect
          {...props}
          aria-invalid={fieldState.invalid}
          placeholder='Add implementers...'
          maxCount={5}
          options={options}
          aria-label='Implementer selection'
          variant='inverted'
        />
      </>
    )
  );
};

export const PrimaryImplementerOptions = ({ control }) => {
  const watchedValues = useWatch({
    control,
    name: ['fieldName1', 'fieldName2'], // Watch specific fields
  });

  const options = useMemo(() => {
    // Map watchedValues to your array of options
    // Example:
    return (
      watchedValues.fieldName1?.map((item) => ({
        value: item.id,
        label: `${item.name} - ${watchedValues.fieldName2}`,
      })) || []
    );
  }, [watchedValues]); // Recompute options only when watchedValues change

  return (
    <div>
      {/* Render your select input or other components using 'options' */}
      <select>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export const StrategyForm = ({ strategyId }) => {
  const { id } = useParams();

  const strategyRefId = strategyId ? strategyId : id ? id : null;

  const { data: implementerList, isLoading: isLoading_imps } =
    useGetAllImplementersQuery(
      { params: { cpic_smes: 'true' }, applyTransformation: true },
      { selectFromResult: ({ data, isLoading }) => ({ data, isLoading }) }
    );

  const strategyParams = {
    timeline: 'true',
    policy: 'true',
    status: 'true',
    implementers: 'true',
  };

  const {
    data: strategy,
    isLoading,
    isSuccess,
  } = useGetStrategyQuery(
    {
      id: strategyRefId,
      params: strategyParams,
    },
    {
      skip: !strategyRefId,
      selectFromResult: ({ data, isLoading, isSuccess }) => ({
        data,
        isLoading,
        isSuccess,
      }),
    }
  );

  const [formVals, setFormVals] = React.useState(null);

  //update the default values of the form with strategy data
  React.useEffect(() => {
    if (strategy?.implementers) {
      const { implementers, ...rest } = strategy;
      //check if there is already an assigned primary implementer
      const primary_implementer =
        implementers.find((i) => i.is_primary === true)?.implementer_id ?? '';

      rest['primary_implementer'] = primary_implementer;

      // Convert ISO date strings to Date objects for the date picker
      rest.current_deadline = rest.current_deadline
        ? new Date(rest.current_deadline)
        : null;
      rest.last_comms_date = rest.last_comms_date
        ? new Date(rest.last_comms_date)
        : null;

      setFormVals({
        ...rest,
        implementers: implementers.map((i) => i.implementer_id),
      });
    }
  }, [strategy]);

  const loading = isLoading == true || isLoading_imps == true || !formVals;

  return loading ? (
    <Skeleton className='max-w-[300px] max-h-[300px]' />
  ) : (
    <>
      <FormComponent
        key={formVals.updatedAt}
        defaultValues={formVals}
        implementerList={implementerList}
      />
    </>
  );
};

const FormComponent = ({ defaultValues, implementerList }) => {
  const auth = useAuth();
  const disabledFields = getDisabledFields(auth);

  const [updateStrategy, { isLoading: isUpdating }] =
    useUpdateStrategyMutation();

  const form = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues,
  });

  const {
    resetField,
    getValues,
    setValue,
    control,
    getFieldState,
    formState: { dirtyFields, isDirty },
  } = form;

  const selectedImplementers = useWatch({ control, name: 'implementers' });

  // When an implementer is removed from the list, clear primary if it was that implementer
  React.useEffect(() => {
    const current_primary = getValues('primary_implementer');

    // "none" and "" are intentional unset states, not stale references
    if (!current_primary || current_primary === 'none') return;

    const isStillInList = selectedImplementers.some(
      (option) => option === current_primary
    );

    if (!isStillInList) {
      const { isDirty: isImplementersDirty } = getFieldState('implementers');
      if (isImplementersDirty) {
        setValue('primary_implementer', 'none', { shouldDirty: true });
      } else {
        resetField('primary_implementer');
      }
    }
  }, [selectedImplementers, setValue, resetField, getValues, getFieldState]);

  const handleStrategyUpdate = async (data, e) => {
    e.preventDefault();
    const changedFields = getDirtyValues(dirtyFields, data);

    if (Object.keys(changedFields).length === 0) return;

    const id = defaultValues.id;

    // Convert Date objects to ISO strings for the API
    if (changedFields.current_deadline !== undefined) {
      changedFields.current_deadline = changedFields.current_deadline
        ? changedFields.current_deadline.toISOString()
        : null;
    }
    if (changedFields.last_comms_date !== undefined) {
      changedFields.last_comms_date = changedFields.last_comms_date
        ? changedFields.last_comms_date.toISOString()
        : null;
    }

    if (changedFields.primary_implementer !== undefined) {
      const val = changedFields.primary_implementer;
      changedFields.primary_implementer =
        !val || val === 'none' ? null : Number(val);
    }

    if (changedFields.implementers !== undefined) {
      const originalList = defaultValues.implementers;
      /*
      .map(
        (i) => i.implementer_id
      );*/
      const newList = changedFields.implementers;
      //console.log({originalList, newList});
      const itemsToRemove = originalList.filter(
        (item) => !newList.includes(item)
      );
      const itemsToAdd = newList.filter((item) => !originalList.includes(item));
      changedFields.implementers = {
        add: itemsToAdd.map((x) => Number(x)),
        remove: itemsToRemove.map((x) => Number(x)),
      };
    }

    //console.log(changedFields);
    const sanitizedData = recursivelySanitizeObject(changedFields);
    //console.log('attempting to update:', { id, data: sanitizedData });

    try {
      const res = await updateStrategy({
        id,
        data: sanitizedData,
      }).unwrap();
      enqueueSnackbar('Strategy updated...', { variant: 'success' });
    } catch (err) {
      enqueueSnackbar(`Update failed: ${err}`, { variant: 'error' });
    }
  };

  return (
    <>
      <FormWrapper
        strategyDetails={defaultValues}
        form={form}
        formId='strategy-form'
        className='w-full'
      >
        <form
          id='strategy-form'
          className='mt-4 space-y-6'
          onSubmit={form.handleSubmit(handleStrategyUpdate)}
        >
          <div className='flex justify-between'>
            <div>
              <Controller
                name='status_id'
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation='responsive'
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor='strategy-status-id-field'>
                        Status
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <StatusSelector
                      fieldState={fieldState}
                      id='strategy-status-id-field'
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={disabledFields.status_id}
                    />
                  </Field>
                )}
              />
            </div>

            <div>
              <Controller
                name='timeline_id'
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation='responsive'
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor='strategy-timeline-id-field'>
                        Timeline
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <TimelineSelector
                      fieldState={fieldState}
                      id='strategy-timeline-id-field'
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={disabledFields.timeline_id}
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <div className='flex justify-between'>
            <div>
              <Controller
                name='current_deadline'
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation='responsive'
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor='strategy-current-deadline-field'>
                        Current Deadline
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <DatePicker
                      id='strategy-current-deadline-field'
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      disabled={disabledFields.current_deadline}
                      placeholder='Select deadline'
                      clearable
                    />
                  </Field>
                )}
              />
            </div>

            <div>
              <Controller
                name='last_comms_date'
                control={control}
                render={({ field, fieldState }) => (
                  <Field
                    orientation='responsive'
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor='strategy-last-comms-date-field'>
                        Last Communication
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>
                    <DatePicker
                      id='strategy-last-comms-date-field'
                      selected={field.value}
                      onSelect={(date) => field.onChange(date)}
                      disabled={disabledFields.last_comms_date}
                      placeholder='Select date'
                      clearable
                    />
                  </Field>
                )}
              />
            </div>
          </div>

          <Separator orientation='horizontal' />

          <Controller
            name='content'
            control={control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor='strategy-description'>
                  Strategy Description
                </FieldLabel>
                <Textarea
                  {...field}
                  id='strategy-description'
                  aria-invalid={fieldState.invalid}
                  placeholder='content...'
                  className='min-h-[150px]'
                  disabled={disabledFields.content}
                />
                <FieldDescription></FieldDescription>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Separator orientation='horizontal' />

          <Controller
            name='implementers'
            control={control}
            render={({ field, fieldState }) => (
              <FieldSet>
                <FieldLegend variant='label'>Implementers</FieldLegend>
                <FieldDescription>
                  Manage assigned Implementers
                </FieldDescription>

                <ImplementerToggle
                  fieldState={fieldState}
                  options={implementerList}
                  name={field.name}
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                  disabled={disabledFields.implementers}
                />

                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldSet>
            )}
          />

          <Controller
            name='primary_implementer'
            control={control}
            render={({ field, fieldState }) => (
              <Field orientation='responsive' data-invalid={fieldState.invalid}>
                <FieldContent>
                  <FieldLabel htmlFor='primary-implementer-id-field'>
                    Primary Implementer
                  </FieldLabel>
                </FieldContent>

                <Select
                  name={field.name}
                  value={field.value || ''}
                  onValueChange={field.onChange}
                  disabled={disabledFields.primary_implementer}
                >
                  <SelectTrigger
                    id='primary-implementer-id-field'
                    className='min-w-[180px]'
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder='select primary implementer' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='none'>
                      <span className='text-muted-foreground'>None</span>
                    </SelectItem>
                    {selectedImplementers
                      .map((i) => implementerList.find((imp) => imp.id === i))
                      .filter(Boolean)
                      .map((implementer) => (
                        <SelectItem key={implementer.id} value={implementer.id}>
                          {implementer.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </form>
      </FormWrapper>
    </>
  );
};
