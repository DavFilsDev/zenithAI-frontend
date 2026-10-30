import { useEffect, useRef } from 'react';
import { IoSend } from 'react-icons/io5';
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
    <form onSubmit={handleSubmit} className="p-4 border-t border-white/10">
      <div className="relative flex items-end rounded-2xl px-3 py-2 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 focus-within:ring-2 focus-within:ring-[rgb(var(--color-primary))]">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={disabled ? 'Please wait...' : "What's on your mind?"}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-[rgb(var(--color-text))] outline-none placeholder:opacity-60 pr-10"
          style={{ minHeight: '24px', maxHeight: '120px', overflow: 'hidden' }}
        />

        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          className="absolute right-1 bottom-1 p-2 rounded-xl bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-[rgb(var(--color-primary))] hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-200 disabled:opacity-40 flex items-center justify-center"
        >
          <IoSend size={18} />
        </button>
      </div>
    </form>
  );
};
