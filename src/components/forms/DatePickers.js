//import tw, { css, theme } from 'twin.macro';
import React, { useEffect, useState, forwardRef } from 'react';
import { getMonth, getYear } from 'date-fns';
import range from 'lodash/range';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/*
const styles = {
  input: ({}) => [
    tw`z-0`,
    tw`text-gray-900 ring-gray-300 placeholder:text-gray-400 focus:ring-blue-500`,
    tw`block w-full rounded-md border-0 py-1.5  shadow-sm ring-1 ring-inset focus:ring-2 focus:ring-inset  sm:text-sm sm:leading-6`,
  ],
  calendarButton: ({}) => [
    tw`m-0.5 rounded-full p-1 text-dark-blue outline-white`,
    tw`focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`,
    css(`
        &:hover {
            color: ${theme`colors.light-blue`};
        }
        &:focus-visible {
            outline-color:${theme`colors.light-blue`};
        }
      `),
  ],
};
*/

const years = range(1920, getYear(new Date()) + 1, 1);
const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DatePickerWithYearAndMonth = forwardRef((props, ref) => {
  return (
    <DatePicker
      ref={ref}
      {...props}
      renderCustomHeader={({
        date,
        changeYear,
        changeMonth,
        decreaseMonth,
        increaseMonth,
        prevMonthButtonDisabled,
        nextMonthButtonDisabled,
      }) => (
        <div className='p-2 flex justify-center h-fit'>
          <button onClick={decreaseMonth} disabled={prevMonthButtonDisabled}>
            <ChevronLeftIcon className='w-4 h-4' aria-hidden='true' />
          </button>

          <select
            className='rounded-l-lg mr-2'
            value={months[getMonth(date)]}
            onChange={({ target: { value } }) =>
              changeMonth(months.indexOf(value))
            }
          >
            {months.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <select
            className='rounded-r-lg'
            value={getYear(date)}
            onChange={({ target: { value } }) => changeYear(value)}
          >
            {years.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button onClick={increaseMonth} disabled={nextMonthButtonDisabled}>
            <ChevronRightIcon className='w-4 h-4' />
          </button>
        </div>
      )}
    />
  );
});
