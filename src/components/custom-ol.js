// components/ui/custom-ol.tsx
import React from 'react';

export const CustomOl = ({ children, className, ...props }) => {
  return (
    <ol className={`list-decimal pl-6 space-y-2 ${className}`} {...props}>
      {children}
    </ol>
  );
};

export const CustomLi = ({ children, className, ...props }) => {
  return (
    <li className={className} {...props}>
      {children}
    </li>
  );
};
