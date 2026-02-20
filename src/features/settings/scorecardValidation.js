import * as yup from 'yup';

export const scorecardConfigSchema = yup.object().shape({
  weight_completion_rate: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Must be between 0 and 1')
    .max(1, 'Must be between 0 and 1')
    .required('Required'),
  weight_on_time_rate: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Must be between 0 and 1')
    .max(1, 'Must be between 0 and 1')
    .required('Required'),
  weight_overdue_penalty: yup
    .number()
    .typeError('Must be a number')
    .min(0, 'Must be between 0 and 1')
    .max(1, 'Must be between 0 and 1')
    .required('Required'),
  grade_a_min: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(1, 'Must be greater than 0')
    .max(100, 'Cannot exceed 100')
    .required('Required'),
  grade_b_min: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(1, 'Must be greater than 0')
    .required('Required'),
  grade_c_min: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(1, 'Must be greater than 0')
    .required('Required'),
  grade_d_min: yup
    .number()
    .typeError('Must be a number')
    .integer('Must be a whole number')
    .min(1, 'Must be greater than 0')
    .required('Required'),
});
