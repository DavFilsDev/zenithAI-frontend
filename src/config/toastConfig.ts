import type { ToastOptions } from 'react-hot-toast';

export const toastConfig: Record<string, ToastOptions> = {
  success: {
    duration: 3000,
    style: {
      background: 'rgba(34, 197, 94, 0.1)',
      color: 'white',
      border: '1px solid rgba(34, 197, 94, 0.3)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '12px 16px',
      whiteSpace: 'nowrap',
      minWidth: '300px',
      maxWidth: '500px',
    },
    iconTheme: {
      primary: '#22c55e',
      secondary: 'white',
    },
  },
  error: {
    duration: 4000,
    style: {
      background: 'rgba(239, 68, 68, 0.1)',
      color: 'white',
      border: '1px solid rgba(239, 68, 68, 0.3)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '12px 16px',
      whiteSpace: 'nowrap',
      minWidth: '300px',
      maxWidth: '500px',
    },
    iconTheme: {
      primary: '#ef4444',
      secondary: 'white',
    },
  },
  loading: {
    duration: Infinity,
    style: {
      background: 'rgba(59, 130, 246, 0.1)',
      color: 'white',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '12px 16px',
      whiteSpace: 'nowrap',
    },
  },
  custom: {
    duration: 4000,
    style: {
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backdropFilter: 'blur(12px)',
      borderRadius: '12px',
      padding: '12px 16px',
      whiteSpace: 'nowrap',
      minWidth: '300px',
      maxWidth: '500px',
    },
  },
};

// Helper function to truncate long messages
export const formatToastMessage = (message: string, maxLength: number = 80): string => {
  if (message.length <= maxLength) return message;
  return message.substring(0, maxLength) + '...';
};