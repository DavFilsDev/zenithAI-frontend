import { TriangleAlert } from 'lucide-react';
import { Button } from './Button';

interface RateLimitToastProps {
  message: string;
  onRetry?: (() => void) | undefined;
  onDismiss: () => void;
}

export const RateLimitToast = ({ message, onRetry, onDismiss }: RateLimitToastProps) => (
  <div className="flex max-w-[420px] items-start gap-3 rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-small text-text">
    <TriangleAlert
      size={16}
      strokeWidth={1.5}
      className="mt-0.5 shrink-0 text-warning"
      aria-hidden="true"
    />
    <p className="flex-1">{message}</p>
    <div className="flex shrink-0 items-center gap-2">
      {onRetry && (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            onDismiss();
            onRetry();
          }}
        >
          Retry
        </Button>
      )}
      <Button size="sm" variant="ghost" onClick={onDismiss}>
        Dismiss
      </Button>
    </div>
  </div>
);
