import React, { Fragment, forwardRef } from 'react';
import get from 'lodash/get';
import has from 'lodash/has';
import { ErrorMessage } from '@hookform/error-message';
import DOMPurify from 'dompurify';
import {
  ErrorMessage as Catalyst_ErrorMSG,
  Field,
  Label,
} from 'catalyst/fieldset.jsx';
import { Input } from '../catalyst/input.jsx';
import { Textarea } from '../catalyst/textarea.jsx';

const sanitizeInput = (input) => DOMPurify.sanitize(input);
const transformEmail = (email) => email.toLowerCase();

export const RegisteredInput = ({
  name,
  label,
  register,
  element = 'input',
  rules = {},
  errors,
  wrapperStyle = '',
  ...props
}) => {
  // If the name is in a FieldArray, it will be 'fields.index.fieldName' and errors[name] won't return anything, so we are using lodash get
  const errorMessages = get(errors, name);
  const hasError = has(errors, name);

  let content;

  if (element === 'input') {
    content = (
      <Input
        invalid={hasError}
        {...props}
        {...(register &&
          register(name, {
            validate: (val) => sanitizeInput(val) !== '',
          }))}
      />
    );
  } else {
    content = (
      <Textarea
        invalid={hasError}
        {...props}
        {...(register &&
          register(name, {
            validate: (val) => sanitizeInput(val) !== '',
          }))}
      />
    );
  }
  /* ORIGINAL ERRORMESSGE

<ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p className='mt-1 text-sm text-left block text-red-600'>{message}</p>
        )}
      />

*/
  return (
    <div aria-live='polite'>
      <Field>
        <Label>{label}</Label>
        {content}
        {hasError && (
          <Catalyst_ErrorMSG>{get(errors, name).message}</Catalyst_ErrorMSG>
        )}
      </Field>
    </div>
  );
};

export const BaseSelect = forwardRef(
  (
    {
      id = uuidv4(),
      name,
      label,
      size = 'medium',
      additionalClasses = undefined,
      placeholder,
      options,
      hasError,
      ...props
    },
    ref
  ) => {
    return (
      <>
        <Label htmlFor={id}>{label}</Label>
        <Wrapper>
          <select
            id={id}
            ref={ref}
            name={name}
            aria-label={label}
            placeholder={placeholder}
            css={baseStyles.select({ size, hasError })}
            {...props}
          >
            {options.map((item, i) => (
              <option key={i} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </Wrapper>
      </>
    );
  }
);

export const RegisteredSelect = ({
  name,
  register,
  rules = {},
  errors,
  wrapperStyle = '',
  options = [],
  ...props
}) => {
  // If the name is in a FieldArray, it will be 'fields.index.fieldName' and errors[name] won't return anything, so we are using lodash get
  const errorMessages = get(errors, name);
  const hasError = !!(errors && errorMessages);
  //console.log('registered select info', { name });
  return (
    <div css={baseStyles.wrapper({ wrapperStyle })} aria-live='polite'>
      <BaseSelect
        hasError={hasError}
        name={name}
        aria-invalid={hasError}
        options={options}
        {...props}
        {...(register && register(name))}
      />
      <ErrorMessage
        errors={errors}
        name={name}
        render={({ message }) => (
          <p tw='mt-1 text-sm text-left block text-red-600'>{message}</p>
        )}
      />
    </div>
  );
};
