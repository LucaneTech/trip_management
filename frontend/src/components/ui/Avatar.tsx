import React from 'react';
import { cn, getInitials } from '../../lib/utils';
import { API_BASE } from '../../api/apiClient';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: 'h-7 w-7 text-2xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
};

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const imgSrc = src ? (src.startsWith('http') ? src : `${API_BASE}${src}`) : null;

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full bg-muted-bg border border-border',
        'font-semibold text-ink shrink-0 overflow-hidden',
        sizes[size],
        className
      )}
    >
      {imgSrc ? (
        <img src={imgSrc} alt={name} className="w-full h-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
