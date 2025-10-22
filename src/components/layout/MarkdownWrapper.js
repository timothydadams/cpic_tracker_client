import * as React from 'react';
import { cn } from 'utils/cn.js';

export const MarkdownWrapper = ({ className, children, ...props }) => (
  <div className={cn('prose dark:prose-invert', className)} {...props}>
    {children}
  </div>
);
