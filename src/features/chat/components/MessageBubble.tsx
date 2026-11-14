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
              ? 'bg-[rgb(var(--color-primary))]/10 text-[rgb(var(--color-text))] border border-[rgb(var(--color-primary))]/20 backdrop-blur-md'
              : 'bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/10'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : isTyping ? (
            <div className="flex space-x-2 py-1">
              <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" />
              <div
                className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}

          {!isTyping && (
            <span className="text-xs mt-2 block opacity-60">
              {new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          )}
        </div>

        {!isTyping && (
          <div className="flex gap-2 mt-2 justify-end opacity-50 group-hover:opacity-100 transition">
            <button
              onClick={() => {
                void handleCopy();
              }}
              title="Copy message"
              className="p-1.5 rounded-lg bg-white/10 dark:bg-white/5 border border-white/10 hover:bg-white/20 transition"
            >
              <Copy size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
