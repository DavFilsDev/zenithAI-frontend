import { useEffect, useRef } from 'react';
import { ArrowUp } from 'lucide-react';
import { useChatUiStore } from '../model/chatUiStore';

interface ComposerProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

export const Composer = ({ onSendMessage, disabled }: ComposerProps) => {
  const draft = useChatUiStore((state) => state.draft);
  const setDraft = useChatUiStore((state) => state.setDraft);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft]);

  const submit = () => {
    const content = draft.trim();

    if (!content || disabled) {
      return;
    }

    setDraft('');
    onSendMessage(content);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex items-end rounded-[var(--radius)] border border-border bg-raised px-3 py-2 focus-within:border-accent">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Please wait...' : "What's on your mind?"}
          aria-label="Message"
          aria-busy={disabled || undefined}
          aria-multiline="true"
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent pr-10 text-body text-text outline-none placeholder:text-text-tertiary disabled:opacity-50"
          style={{ minHeight: '24px', maxHeight: '120px', overflow: 'hidden' }}
        />

        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
          className="absolute right-1 bottom-1 flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] border border-border bg-surface text-accent-text transition-colors duration-fast hover:bg-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ArrowUp size={16} strokeWidth={1.5} />
        </button>
      </div>
    </form>
  );
};
