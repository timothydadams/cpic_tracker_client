import React, { useState, useEffect } from 'react';
import { Button } from 'catalyst/button.jsx';
import { Heading, Subheading } from 'catalyst/heading.jsx';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectCurrentWind,
  selectCurrentAlt,
  setLimits,
  resetWx,
  selectCurrentLimits,
} from './wxSlice';
//AUTOMATICALLY CONROLS FORM State so you dont need a million useStates etc
//yup does the validation and you can make up custom "formulas" for different types of fields
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { RegisteredInput } from 'components/forms/Input';
import { enqueueSnackbar } from 'notistack';

//form validation
const schema = yup.object().shape({
  maxAlt: yup.number(),
  maxWind: yup.number(),
});

export const WeatherLimitController = (props) => {
  const dispatch = useDispatch();
  const limits = useSelector(selectCurrentLimits);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty, isValid },
  } = useForm({
    mode: 'all',
    resolver: yupResolver(schema),
  });

  const updateParameters = (data, e) => {
    e.preventDefault();
    dispatch(setLimits(data));
  };

  useEffect(() => {
    reset({
      maxWind: limits?.maxWind,
      maxAlt: limits?.maxAlt,
    });
  }, [limits]);

  return (
    <div className='py-8 px-4'>
      <Heading>Flight Parameters</Heading>

      <form
        className='mt-4 flex justify-between'
        onSubmit={handleSubmit(updateParameters)}
      >
        <RegisteredInput
          type='number'
          min='0'
          label='Max Anticipated Altitude (ft AGL)'
          name='maxAlt'
          register={register}
          errors={errors}
        />

        <RegisteredInput
          type='number'
          min='0'
          step='1'
          label='Wind Limit for Drone (KTs)'
          name='maxWind'
          register={register}
          errors={errors}
        />

        <div className='pt-5 flex justify-end'>
          <Button type='submit' outline='true' disabled={!isDirty || !isValid}>
            Update Parameters
          </Button>
          <Button outline='true' onClick={() => dispatch(resetWx())}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
};
