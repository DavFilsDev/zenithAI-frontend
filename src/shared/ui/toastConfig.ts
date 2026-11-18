import type { CSSProperties } from 'react';
import type { ToastOptions } from 'react-hot-toast';

export type ToastSeverity = 'success' | 'error' | 'loading' | 'rateLimit';

const baseStyle: CSSProperties = {
  background: 'var(--color-surface)',
  color: 'var(--color-text)',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius)',
  padding: '12px 16px',
  fontSize: 'var(--text-small)',
  lineHeight: 'var(--text-small--line-height)',
  maxWidth: '420px',
};

export const toastConfig: Record<ToastSeverity, ToastOptions> = {
  success: {
    duration: 3000,
    style: baseStyle,
  },
  error: {
    duration: 4000,
    style: baseStyle,
  },
  loading: {
    duration: Infinity,
    style: baseStyle,
  },
  rateLimit: {
    duration: 8000,
    style: baseStyle,
  },
};

export const formatToastMessage = (message: string, maxLength: number = 80): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};
