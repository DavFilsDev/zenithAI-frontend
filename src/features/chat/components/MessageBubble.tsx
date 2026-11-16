import ReactMarkdown from 'react-markdown';
import { Copy } from 'lucide-react';
import { notify } from '../../../shared/ui/notify';
import type { Message } from '../api/types';

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === 'user';
  const isTyping = !isUser && message.content === '';

  const handleCopy = async () => {
    if (!navigator.clipboard) {
      notify.error('Clipboard is not available.');
      return;
    }

    try {
      await navigator.clipboard.writeText(message.content);
      notify.success('Copied to clipboard.');
    } catch {
      notify.error('Could not copy message.');
    }
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className="group max-w-[70%]">
        <div
          className={`rounded-xl p-4 ${
            isUser
              ? 'border border-[rgb(var(--color-primary))]/20 bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text))] backdrop-blur-md'
              : 'border border-white/10 bg-white/10 backdrop-blur-md dark:bg-white/5'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : isTyping ? (
            <div className="flex space-x-2 py-1">
              <div className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--color-primary))]" />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--color-primary))]"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--color-primary))]"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {!isTyping && (
            <span className="mt-2 block text-xs opacity-60">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {!isTyping && (
          <div className="mt-2 flex justify-end gap-2 opacity-50 transition group-hover:opacity-100">
            <button
              onClick={() => {
                void handleCopy();
              }}
              title="Copy message"
              className="rounded-lg border border-white/10 bg-white/10 p-1.5 transition hover:bg-white/20 dark:bg-white/5"
            >
              <Copy size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
