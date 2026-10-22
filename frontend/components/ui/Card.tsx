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
  const baseClasses = hoverEffect ? 'card-shell' : 'bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5';

  return (
    <div
      className={`${baseClasses} ${hoverEffect ? 'p-5' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
