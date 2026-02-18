import React from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { enqueueSnackbar } from 'notistack';
import { useCreateStrategyMutation } from './strategiesApiSlice';
import {
  StatusSelector,
  TimelineSelector,
  ImplementerToggle,
} from './EditStrategyForm';
import { useGetAllFocusAreasQuery } from '../focus_areas/focusAreaApiSlice';
import { useGetAllPoliciesQuery } from '../policies/policiesApiSlice';
import { useGetAllImplementersQuery } from '../implementers/implementersApiSlice';
import { recursivelySanitizeObject } from 'utils/rhf_helpers';
import { Button } from 'ui/button';
import { Textarea } from 'ui/textarea';
import { Separator } from 'ui/separator';
import { Spinner } from 'ui/spinner';
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
  FieldLegend,
} from 'ui/field';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';

const schema = yup.object().shape({
  focus_area_id: yup.string().required('Focus area is required'),
  policy_id: yup.string().required('Policy is required'),
  status_id: yup.string().required('Status is required'),
  timeline_id: yup.string().required('Timeline is required'),
  content: yup.string().required('Strategy description is required'),
  implementers: yup
    .array()
    .min(1, 'At least one implementer is required')
    .required('At least one implementer is required'),
});

export const CreateStrategyForm = ({ onSuccess, onCancel }) => {
  const [createStrategy, { isLoading: isCreating }] =
    useCreateStrategyMutation();

  const { data: implementerList } = useGetAllImplementersQuery(
    { params: { cpic_smes: 'true' }, applyTransformation: true },
    { selectFromResult: ({ data }) => ({ data }) }
  );

  const { data: focusAreas } = useGetAllFocusAreasQuery(undefined, {
    selectFromResult: ({ data }) => ({ data }),
  });
  const { data: policies } = useGetAllPoliciesQuery(
    { area: 'true', strategies: 'false' },
    { selectFromResult: ({ data }) => ({ data }) }
  );

  const form = useForm({
    mode: 'onBlur',
    resolver: yupResolver(schema),
    defaultValues: {
      focus_area_id: '',
      policy_id: '',
      status_id: '',
      timeline_id: '',
      content: '',
      implementers: [],
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    formState: { isValid, isDirty },
  } = form;

  const selectedFocusAreaId = useWatch({ control, name: 'focus_area_id' });

  const filteredPolicies = React.useMemo(() => {
    if (!policies || !selectedFocusAreaId) return [];
    return policies
      .filter((p) => String(p.focus_area_id) === String(selectedFocusAreaId))
      .sort((a, b) => a.policy_number - b.policy_number);
  }, [policies, selectedFocusAreaId]);

  // Clear policy when focus area changes
  React.useEffect(() => {
    setValue('policy_id', '');
  }, [selectedFocusAreaId, setValue]);

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    try {
      const sanitized = recursivelySanitizeObject({
        content: data.content,
        policy_id: data.policy_id,
        timeline_id: Number(data.timeline_id),
        status_id: Number(data.status_id),
        focus_area_id: Number(data.focus_area_id),
        implementers: data.implementers.map((id) => Number(id)),
      });
      await createStrategy(sanitized).unwrap();
      enqueueSnackbar('Strategy created', { variant: 'success' });
      onSuccess?.();
    } catch (err) {
      enqueueSnackbar(
        `Failed to create strategy: ${err?.data?.message || err}`,
        { variant: 'error' }
      );
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
      <Controller
        name='focus_area_id'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='create-focus-area'>Focus Area</FieldLabel>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
            >
              <SelectTrigger
                id='create-focus-area'
                aria-invalid={fieldState.invalid}
              >
                <SelectValue placeholder='Select focus area' />
              </SelectTrigger>
              <SelectContent>
                {focusAreas?.map((fa) => (
                  <SelectItem key={fa.id} value={String(fa.id)}>
                    {fa.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        name='policy_id'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='create-policy'>Policy</FieldLabel>
            <Select
              name={field.name}
              value={field.value}
              onValueChange={field.onChange}
              disabled={!selectedFocusAreaId}
            >
              <SelectTrigger
                id='create-policy'
                aria-invalid={fieldState.invalid}
              >
                <SelectValue
                  placeholder={
                    selectedFocusAreaId
                      ? 'Select policy'
                      : 'Select a focus area first'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {filteredPolicies.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.policy_number}. {p.description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <div className='flex justify-between gap-4'>
        <Controller
          name='status_id'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor='create-status'>Status</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <StatusSelector
                fieldState={fieldState}
                id='create-status'
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
            </Field>
          )}
        />

        <Controller
          name='timeline_id'
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldContent>
                <FieldLabel htmlFor='create-timeline'>Timeline</FieldLabel>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </FieldContent>
              <TimelineSelector
                fieldState={fieldState}
                id='create-timeline'
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              />
            </Field>
          )}
        />
      </div>

      <Separator orientation='horizontal' />

      <Controller
        name='content'
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor='create-content'>
              Strategy Description
            </FieldLabel>
            <Textarea
              {...field}
              id='create-content'
              placeholder='Describe the strategy...'
              aria-invalid={fieldState.invalid}
              className='min-h-[120px]'
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
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
              Assign implementers to this strategy
            </FieldDescription>
            <ImplementerToggle
              fieldState={fieldState}
              options={implementerList}
              name={field.name}
              defaultValue={field.value}
              onValueChange={field.onChange}
            />
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </FieldSet>
        )}
      />

      <div className='flex justify-end gap-2 pt-4'>
        <Button type='button' variant='outline' onClick={onCancel}>
          Cancel
        </Button>
        <Button type='submit' disabled={!isDirty || !isValid || isCreating}>
          {isCreating ? (
            <>
              <Spinner />
              Creating...
            </>
          ) : (
            'Create Strategy'
          )}
        </Button>
      </div>
    </form>
  );
};
