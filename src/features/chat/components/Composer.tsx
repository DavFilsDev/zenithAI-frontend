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
    <form onSubmit={handleSubmit} className="border-t border-white/10 p-4">
      <div className="relative flex items-end rounded-2xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur-md focus-within:ring-2 focus-within:ring-accent-text dark:border-white/10 dark:bg-white/5">
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
          className="flex-1 resize-none bg-transparent pr-10 text-text outline-none placeholder:opacity-60"
          style={{ minHeight: '24px', maxHeight: '120px', overflow: 'hidden' }}
        />

        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          aria-label="Send message"
          className="absolute right-1 bottom-1 flex items-center justify-center rounded-xl border border-white/20 bg-white/10 p-2 text-accent-text backdrop-blur-md transition-all duration-200 hover:bg-white/20 disabled:opacity-40 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
        >
          <ArrowUp size={20} strokeWidth={1.5} />
        </button>
      </div>
    </form>
  );
};
