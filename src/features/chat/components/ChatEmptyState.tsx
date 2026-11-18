import { useChatUiStore } from '../model/chatUiStore';

const suggestions = [
  'Explain this TypeScript error',
  'Refactor this function for clarity',
  'Write a unit test for this component',
  'Review this code for issues',
];

export const ChatEmptyState = () => {
  const setDraft = useChatUiStore((state) => state.setDraft);

  const handleSuggestionClick = (suggestion: string) => {
    setDraft(suggestion);
    document.getElementById('chat-composer')?.focus();
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 sm:px-6">
      <div className="w-full max-w-[720px]">
        <h1 className="text-h1 text-text">Start a conversation.</h1>
        <p className="mt-2 text-body text-text-secondary">
          Ask a question or describe what you want to work on.
        </p>
        <div className="mt-6 grid gap-2">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              className="w-full rounded-[var(--radius)] border border-border bg-surface px-4 py-3 text-left text-body text-text transition-colors duration-fast hover:bg-hover"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
