'use client';

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverEffect?: boolean;
  className?: string;
}

export function Card({
  children,
  hoverEffect = false,
  className = '',
  ...props
}: CardProps) {
  const hoverStyles = hoverEffect
    ? 'hover:shadow-md hover:border-slate-300 transition-all duration-200'
    : '';

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 shadow-xs p-5 ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
