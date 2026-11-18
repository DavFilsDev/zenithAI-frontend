import { useEffect, useRef } from 'react';
import { ArrowUp, Square } from 'lucide-react';
import { useChatUiStore } from '../model/chatUiStore';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  onStop?: () => void;
  isStreaming?: boolean;
  disabled?: boolean;
}

export const Composer = ({
  onSendMessage,
  onStop,
  isStreaming = false,
  disabled,
}: ComposerProps) => {
  const draft = useChatUiStore((state) => state.draft);
  const setDraft = useChatUiStore((state) => state.setDraft);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    const styles = window.getComputedStyle(textarea);
    const lineHeight = Number.parseFloat(styles.lineHeight) || 24;
    const paddingY = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom);
    const maxHeight = lineHeight * 8 + paddingY;
    const nextHeight = Math.min(textarea.scrollHeight, maxHeight);

    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, [draft]);

  const submit = () => {
    const content = draft.trim();

    if (!content || disabled || isStreaming) {
      return;
    }

    setDraft('');
    onSendMessage(content);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (isStreaming) {
      onStop?.();
      return;
    }

    submit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Escape' && isStreaming) {
      event.preventDefault();
      onStop?.();
      return;
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end rounded-[var(--radius)] border border-border bg-raised px-3 py-2 focus-within:border-accent">
        <textarea
          id="chat-composer"
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isStreaming ? 'Assistant is responding...' : "What's on your mind?"}
          aria-label="Message"
          aria-busy={isStreaming || undefined}
          aria-multiline="true"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent pr-10 text-body text-text outline-none placeholder:text-text-tertiary disabled:opacity-50"
          style={{ minHeight: '24px' }}
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={onStop}
            aria-label="Stop generating"
            className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface text-text transition-colors duration-fast hover:bg-hover"
          >
            <Square size={14} strokeWidth={1.5} aria-hidden="true" />
          </button>
        ) : (
          <button
            type="submit"
            disabled={disabled || !draft.trim()}
            aria-label="Send message"
            className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface text-accent-text transition-colors duration-fast hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ArrowUp size={16} strokeWidth={1.5} />
          </button>
        )}
      </div>
      <p className="mt-2 font-mono text-small text-text-tertiary">
        Enter to send · Shift+Enter for newline
      </p>
    </form>
  );
};
