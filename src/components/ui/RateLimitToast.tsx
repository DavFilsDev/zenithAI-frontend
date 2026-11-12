interface RateLimitToastProps {
  message: string;
  onRetry?: () => void;
  onDismiss: () => void;
}

export const RateLimitToast = ({ message, onRetry, onDismiss }: RateLimitToastProps) => (
  <div className="flex items-center gap-3 rounded-xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-sm text-white backdrop-blur-md">
    <span className="flex-1">{message}</span>
    {onRetry && (
      <button
        type="button"
        onClick={() => {
          onDismiss();
          onRetry();
        }}
        className="rounded-lg border border-amber-400/50 px-3 py-1 font-medium text-amber-200 hover:bg-amber-400/10"
      >
        Retry
      </button>
    )}
    <button
      type="button"
      onClick={onDismiss}
      className="text-white/60 hover:text-white"
      aria-label="Dismiss"
    >
      Dismiss
    </button>
  </div>
);
