import clsx from 'clsx';

import { Button } from './button.jsx';

export function Pagination({
  'aria-label': ariaLabel = 'Page navigation',
  className,
  ...props
}) {
  return (
    <nav
      aria-label={ariaLabel}
      {...props}
      className={clsx(className, 'flex gap-x-2')}
    />
  );
}

export function PaginationPrevious({
  href = null,
  className,
  children = 'Previous',
  onClick = null,
}) {
  return (
    <span className={clsx(className, 'grow basis-0')}>
      <Button
        {...(href === null && onClick === null ? { disabled: true } : { href })}
        {...(onClick !== null && { onClick })}
        plain
        aria-label='Previous page'
      >
        <svg
          className='stroke-current'
          data-slot='icon'
          viewBox='0 0 16 16'
          fill='none'
          aria-hidden='true'
        >
          <path
            d='M2.75 8H13.25M2.75 8L5.25 5.5M2.75 8L5.25 10.5'
            strokeWidth={1.5}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
        {children}
      </Button>
    </span>
  );
}

export function PaginationNext({
  href = null,
  className,
  children = 'Next',
  onClick = null,
}) {
  return (
    <span className={clsx(className, 'flex grow basis-0 justify-end')}>
      <Button
        {...(href === null && onClick == null ? { disabled: true } : { href })}
        {...(onClick !== null && { onClick })}
        plain
        aria-label='Next page'
      >
        {children}
        <svg
          className='stroke-current'
          data-slot='icon'
          viewBox='0 0 16 16'
          fill='none'
          aria-hidden='true'
        >
          <path
            d='M13.25 8L2.75 8M13.25 8L10.75 10.5M13.25 8L10.75 5.5'
            strokeWidth={1.5}
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>
      </Button>
    </span>
  );
}

export function PaginationList({ className, ...props }) {
  return (
    <span
      {...props}
      className={clsx(className, 'hidden items-baseline gap-x-2 sm:flex')}
    />
  );
}

export function PaginationPage({
  href,
  className,
  current = false,
  children,
  onClick = null,
}) {
  return (
    <Button
      href={href}
      {...(onClick !== null && { onClick })}
      plain
      aria-label={`Page ${children}`}
      aria-current={current ? 'page' : undefined}
      className={clsx(
        className,
        'min-w-[2.25rem] before:absolute before:-inset-px before:rounded-lg',
        current && 'before:bg-zinc-950/5 dark:before:bg-white/10'
      )}
    >
      <span className='-mx-0.5'>{children}</span>
    </Button>
  );
}

export function PaginationGap({
  className,
  children = <>&hellip;</>,
  ...props
}) {
  return (
    <span
      aria-hidden='true'
      {...props}
      className={clsx(
        className,
        'w-[2.25rem] select-none text-center text-sm/6 font-semibold text-zinc-950 dark:text-white'
      )}
    >
      {children}
    </span>
  );
}

/* ADDED COMPONENTS */

export const PaginationJump = ({
  icon,
  location = 'front',
  href = null,
  className,
  children = 'Previous',
  onClick = null,
}) => {
  return (
    <span
      className={clsx(
        className,
        location == 'front' ? 'grow basis-0' : 'flex grow basis-0 justify-end'
      )}
    >
      <Button
        {...(href === null && onClick === null ? { disabled: true } : { href })}
        {...(onClick !== null && { onClick })}
        plain
        aria-label='Previous page'
      >
        {icon}
        {children}
      </Button>
    </span>
  );
};
