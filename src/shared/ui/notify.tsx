import { CircleAlert, CircleCheck, LoaderCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import type { ToastOptions } from 'react-hot-toast';
import { toastConfig, formatToastMessage } from './toastConfig';
import { RateLimitToast } from './RateLimitToast';
import type { ApiError } from '../api/apiError';

const formatRetryAfter = (seconds: number | null): string => {
  if (seconds === null || seconds <= 0) {
    return 'Try again later.';
  }

  if (seconds < 60) {
    return `Try again in ${seconds} second${seconds === 1 ? '' : 's'}.`;
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`;
  }

  const hours = Math.ceil(minutes / 60);
  return `Try again in ${hours} hour${hours === 1 ? '' : 's'}.`;
};

const rateLimitMessage = (error: ApiError): string => {
  const wait = formatRetryAfter(error.retryAfter);

  if (error.code === 'quota_exhausted') {
    return `Daily limit reached. ${wait}`;
  }

  return `Too many requests. ${wait}`;
};

const success = (message: string, options?: ToastOptions): string =>
  toast.success(formatToastMessage(message), {
    ...toastConfig.success,
    icon: <CircleCheck size={16} strokeWidth={1.5} className="text-success" aria-hidden="true" />,
    ...options,
  });

const error = (message: string, options?: ToastOptions): string =>
  toast.error(formatToastMessage(message), {
    ...toastConfig.error,
    icon: <CircleAlert size={16} strokeWidth={1.5} className="text-danger" aria-hidden="true" />,
    ...options,
  });

const loading = (message = 'Loading...'): string =>
  toast.loading(formatToastMessage(message), {
    ...toastConfig.loading,
    icon: (
      <LoaderCircle
        size={16}
        strokeWidth={1.5}
        className="animate-spin text-text-secondary"
        aria-hidden="true"
      />
    ),
  });

const rateLimit = (apiError: ApiError, onRetry?: () => void): string =>
  toast.custom(
    (instance) => (
      <RateLimitToast
        message={rateLimitMessage(apiError)}
        onRetry={onRetry}
        onDismiss={() => toast.dismiss(instance.id)}
      />
    ),
    toastConfig.rateLimit,
  );

const dismiss = (toastId?: string): void => {
  if (toastId) {
    toast.dismiss(toastId);
  } else {
    toast.dismiss();
  }
};

export const notify = {
  success,
  error,
  loading,
  rateLimit,
  dismiss,
};
