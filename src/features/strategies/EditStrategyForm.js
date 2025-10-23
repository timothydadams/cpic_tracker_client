import * as React from 'react';
import { useParams } from 'react-router-dom';
import {
  useGetStrategyQuery,
  useUpdateStrategyMutation,
} from './strategiesApiSlice';
import { enqueueSnackbar } from 'notistack';
import { useGetAllImplementersQuery } from '../implementers/implementersApiSlice';
import { Loading } from 'components/Spinners';
import { useForm, Controller, useWatch, useFieldArray } from 'react-hook-form';
import { getDirtyValues } from 'utils/rhf_helpers';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button } from 'ui/button';
import { Separator } from 'ui/separator';
import { Checkbox } from 'ui/checkbox';

import { useSelector } from 'react-redux';
import { selectImplementers } from '../implementers/implementersSlice';

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

//form validation
const schema = yup.object().shape({
  content: yup.string().required('Description is required'),
  status_id: yup.string().required(),
  timeline_id: yup.string().required(),
  implementers: yup.array().min(1),
  primary_implementer: yup.string().required(),
});

const addLabelValue = (item, labelKey, valueKey) => {
  return {
    ...item,
    label: item[labelKey],
    value: item[valueKey],
  };
};

export const TimelineSelector = ({ id, fieldState, ...props }) => {
  const { data: timelineOptions } = useGetAllTimelineOptionsQuery();

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
  const { data: statusOptions } = useGetAllStatusesQuery();

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

export const ImplementerToggle = ({ fieldState, ...props }) => {
  const implementers = useSelector(selectImplementers);
  /*
  const params = {
    cpic_smes: 'true',
  };

  const { data: transformedImplementers, isLoading } =
    useGetAllImplementersQuery({
      params,
      applyTransformation: true,
  });
  */

  return (
    implementers && (
      <>
        <MultiSelect
          {...props}
          aria-invalid={fieldState.invalid}
          placeholder='Add implementers...'
          maxCount={5}
          options={implementers}
          aria-label='Implementer selection'
          variant='inverted'
        />
      </>
    )
  );
};

export const StrategyForm = () => {
  const { id } = useParams();

  const { data: implementers, isLoading: isLoading_imps } =
    useGetAllImplementersQuery({
      params: { cpic_smes: 'true' },
      applyTransformation: true,
    });

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
    refetch: refetchStrategy,
  } = useGetStrategyQuery(
    {
      id,
      params: strategyParams,
    },
    {
      skip: !id,
    }
  );

  React.useEffect(() => {
    console.log('strategy changed:', strategy);
  }, [strategy]);

  const [updateStrategy, { isLoading: isUpdating }] =
    useUpdateStrategyMutation();

  const form = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      status_id: '',
      timeline_id: '',
      content: '',
      implementers: [],
      primary_implementer: '',
    },
  });

  const {
    reset,
    getValues,
    setValue,
    control,
    formState: { dirtyFields },
  } = form;

  React.useEffect(() => {
    if (strategy?.implementers) {
      const { implementers, ...rest } = strategy;
      const primary_implementer =
        implementers.find((i) => i.is_primary === true)?.implementer_id || null;
      if (primary_implementer) {
        setValue('primary_implementer', primary_implementer);
      }
      //setValue("content", strategy.content);
      //setValue("implementers", implementers.map(i => i.implementer_id));
      //setValue("status_id", strategy.status_id);
      //setValue("timeline_id", strategy.timeline_id);

      //console.log("found primary imp:", primary_implementer);
      reset({
        ...rest,
        implementers: implementers.map((i) => i.implementer_id),
      });
    }
  }, [strategy, reset]);

  // Watch the value of the 'category' field
  const selectedImplementers = useWatch({
    control,
    name: 'implementers',
  });

  const mappedImplementers = React.useMemo(() => {
    return selectedImplementers.map((i) =>
      implementers.find((imp) => imp.id === i)
    );
  });

  React.useEffect(() => {
    if (selectedImplementers && strategy) {
      const { implementers, ...rest } = strategy;
      const primary_implementer =
        implementers.find((i) => i.is_primary === true)?.implementer_id || null;
      if (primary_implementer) {
        setValue('primary_implementer', primary_implementer);
      }
    }
  }, [selectedImplementers]);

  const handleStrategyUpdate = async (data, e) => {
    e.preventDefault();
    const changedFields = getDirtyValues(dirtyFields, data);

    if (Object.keys(changedFields).length === 0) return;

    if (changedFields.implementers !== undefined) {
      const originalList = strategy.implementers.map((i) => i.implementer_id);
      const newList = data.implementers;
      const itemsToRemove = originalList.filter(
        (item) => !newList.includes(item)
      );
      const itemsToAdd = newList.filter((item) => !originalList.includes(item));
      changedFields.implementers = {
        add: itemsToAdd.map((x) => Number(x)),
        remove: itemsToRemove.map((x) => Number(x)),
      };
    }

    //console.log('changed fields:', changedFields);

    try {
      const res = await updateStrategy({ id, data: changedFields }).unwrap();
      enqueueSnackbar('Strategy updated...', { variant: 'success' });
      refetchStrategy();
    } catch (err) {
      /*
          if (!err?.originalStatus) {
            enqueueSnackbar('No server response', { variant: 'error' });
            //setErrorMsg('No server response');
          } else if (err?.originalStatus === 400) {
            enqueueSnackbar('Missing username or password', { variant: 'error' });
            //setErrorMsg('Missing username or password');
          } else {
            enqueueSnackbar('Update failed', { variant: 'error' });
            //setErrorMsg('Update failed');
          }
            */
    }
  };

  console.log('selected imps:', selectedImplementers);

  const loading = isLoading == true || isLoading_imps == true;

  return loading ? (
    <Loading />
  ) : (
    strategy && (
      <>
        <FormWrapper
          strategyDetails={strategy}
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
                    name={field.name}
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />

            {mappedImplementers && (
              <Controller
                name='primary_implementer'
                control={control}
                defaultValue=''
                render={({ field, fieldState }) => (
                  <Field
                    orientation='responsive'
                    data-invalid={fieldState.invalid}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor='primary-implementer-id-field'>
                        Primary Implementer
                      </FieldLabel>
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </FieldContent>

                    <Select
                      name={field.name}
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <SelectTrigger
                        id='primary-implementer-id-field'
                        className='min-w-[180px]'
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue placeholder='select primary implementer' />
                      </SelectTrigger>
                      <SelectContent>
                        {mappedImplementers.map((implementer) => (
                          <SelectItem
                            key={implementer.id}
                            value={implementer.id}
                          >
                            {implementer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            )}
          </form>
        </FormWrapper>
      </>
    )
  );
};
