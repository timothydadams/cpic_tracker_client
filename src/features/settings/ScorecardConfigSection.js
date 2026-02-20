import React from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { enqueueSnackbar } from 'notistack';
import {
  useGetScorecardConfigQuery,
  useUpdateScorecardConfigMutation,
} from './settingsApiSlice';
import { scorecardConfigSchema } from './scorecardValidation';
import { getDirtyValues } from 'utils/rhf_helpers';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from 'ui/card';
import { Fieldset, Legend, Field, Label } from 'catalyst/fieldset';
import { Text } from 'catalyst/text';
import { Input } from 'catalyst/input';
import { Button } from 'catalyst/button';
import { Divider } from 'catalyst/divider';
import { Spinner } from 'ui/spinner';
import { Dots } from 'components/Spinners';

export const ScorecardConfigSection = () => {
  const { data: config, isLoading } = useGetScorecardConfigQuery(undefined, {
    selectFromResult: ({ data, isLoading }) => ({ data, isLoading }),
  });

  if (isLoading || !config) return <Dots />;

  return <ScorecardForm key={JSON.stringify(config)} defaultValues={config} />;
};

const ScorecardForm = ({ defaultValues }) => {
  const [updateConfig, { isLoading: isUpdating }] =
    useUpdateScorecardConfigMutation();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid, dirtyFields },
    reset,
  } = useForm({
    mode: 'onChange',
    resolver: yupResolver(scorecardConfigSchema),
    defaultValues,
  });

  const weights = useWatch({
    control,
    name: [
      'weight_completion_rate',
      'weight_on_time_rate',
      'weight_overdue_penalty',
    ],
  });
  const weightSum = weights.reduce((sum, v) => sum + (Number(v) || 0), 0);
  const weightsSumValid = Math.abs(weightSum - 1.0) <= 0.001;

  const grades = useWatch({
    control,
    name: ['grade_a_min', 'grade_b_min', 'grade_c_min', 'grade_d_min'],
  });
  const [gradeA, gradeB, gradeC, gradeD] = grades.map((v) => Number(v) || 0);
  const gradesDescending =
    gradeA > gradeB && gradeB > gradeC && gradeC > gradeD && gradeD > 0;
  const gradeOrderError = {
    a: gradeA > 0 && gradeA <= gradeB,
    b: gradeB > 0 && (gradeB >= gradeA || gradeB <= gradeC),
    c: gradeC > 0 && (gradeC >= gradeB || gradeC <= gradeD),
    d: gradeD > 0 && gradeD >= gradeC,
  };

  const onSubmit = async (data, e) => {
    e?.preventDefault();
    const changedFields = getDirtyValues(dirtyFields, data);

    if (Object.keys(changedFields).length === 0) return;

    // Client-side cross-field validation
    const weightSum =
      data.weight_completion_rate +
      data.weight_on_time_rate +
      data.weight_overdue_penalty;
    if (Math.abs(weightSum - 1.0) > 0.001) {
      enqueueSnackbar(
        `Weights must sum to 1.0 (currently ${weightSum.toFixed(3)})`,
        { variant: 'error' }
      );
      return;
    }

    if (
      !(
        data.grade_a_min > data.grade_b_min &&
        data.grade_b_min > data.grade_c_min &&
        data.grade_c_min > data.grade_d_min
      )
    ) {
      enqueueSnackbar(
        'Grade thresholds must be strictly descending (A > B > C > D)',
        { variant: 'error' }
      );
      return;
    }

    try {
      const result = await updateConfig(changedFields).unwrap();
      reset(result);
      enqueueSnackbar('Scorecard configuration updated', {
        variant: 'success',
      });
    } catch (err) {
      enqueueSnackbar(
        err?.data?.message || 'Failed to update scorecard configuration',
        { variant: 'error' }
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scorecard Configuration</CardTitle>
        <CardDescription>
          Adjust the scoring weights and grade thresholds used by the
          implementer scorecard. Weights must sum to 1.0 and grade thresholds
          must be strictly descending.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className='space-y-6'>
          <Fieldset>
            <Legend>Scoring Weights</Legend>
            <Text>
              Each weight controls how much that factor contributes to the
              overall implementer score. All three must sum to 1.0.
            </Text>

            <div className='grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4'>
              <Field>
                <Label>Completion Rate</Label>
                <Input
                  {...register('weight_completion_rate', {
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  min='0'
                  max='1'
                  invalid={!!errors.weight_completion_rate}
                />
                {errors.weight_completion_rate && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.weight_completion_rate.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label>On-Time Rate</Label>
                <Input
                  {...register('weight_on_time_rate', {
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  min='0'
                  max='1'
                  invalid={!!errors.weight_on_time_rate}
                />
                {errors.weight_on_time_rate && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.weight_on_time_rate.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label>Overdue Penalty</Label>
                <Input
                  {...register('weight_overdue_penalty', {
                    valueAsNumber: true,
                  })}
                  type='number'
                  step='0.01'
                  min='0'
                  max='1'
                  invalid={!!errors.weight_overdue_penalty}
                />
                {errors.weight_overdue_penalty && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.weight_overdue_penalty.message}
                  </p>
                )}
              </Field>
            </div>

            <p
              className={`mt-3 text-sm font-medium ${
                weightsSumValid
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              Sum: {weightSum.toFixed(2)}
              {!weightsSumValid && ' — must equal 1.00'}
            </p>
          </Fieldset>

          <Divider />

          <Fieldset>
            <Legend>Grade Thresholds</Legend>
            <Text>
              Minimum score required for each letter grade. Must be strictly
              descending (A &gt; B &gt; C &gt; D).
            </Text>

            <div className='grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4'>
              <Field>
                <Label>A Minimum</Label>
                <Input
                  {...register('grade_a_min', { valueAsNumber: true })}
                  type='number'
                  min='1'
                  max='100'
                  invalid={!!errors.grade_a_min || gradeOrderError.a}
                />
                {errors.grade_a_min && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.grade_a_min.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label>B Minimum</Label>
                <Input
                  {...register('grade_b_min', { valueAsNumber: true })}
                  type='number'
                  min='1'
                  invalid={!!errors.grade_b_min || gradeOrderError.b}
                />
                {errors.grade_b_min && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.grade_b_min.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label>C Minimum</Label>
                <Input
                  {...register('grade_c_min', { valueAsNumber: true })}
                  type='number'
                  min='1'
                  invalid={!!errors.grade_c_min || gradeOrderError.c}
                />
                {errors.grade_c_min && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.grade_c_min.message}
                  </p>
                )}
              </Field>

              <Field>
                <Label>D Minimum</Label>
                <Input
                  {...register('grade_d_min', { valueAsNumber: true })}
                  type='number'
                  min='1'
                  invalid={!!errors.grade_d_min || gradeOrderError.d}
                />
                {errors.grade_d_min && (
                  <p className='text-sm text-red-600 dark:text-red-500 mt-1'>
                    {errors.grade_d_min.message}
                  </p>
                )}
              </Field>
            </div>

            <p
              className={`mt-3 text-sm font-medium ${
                gradesDescending
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-500'
              }`}
            >
              {gradesDescending
                ? `A(${gradeA}) > B(${gradeB}) > C(${gradeC}) > D(${gradeD})`
                : `Thresholds must be strictly descending — A(${gradeA}) > B(${gradeB}) > C(${gradeC}) > D(${gradeD})`}
            </p>
          </Fieldset>
        </CardContent>

        <CardFooter className='justify-end'>
          <Button
            type='submit'
            disabled={
              !isDirty ||
              !isValid ||
              !weightsSumValid ||
              !gradesDescending ||
              isUpdating
            }
          >
            {isUpdating ? (
              <>
                <Spinner /> Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
