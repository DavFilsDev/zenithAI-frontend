import ReactMarkdown, { defaultUrlTransform, type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeSanitize from 'rehype-sanitize';
import rehypeHighlight from 'rehype-highlight';
import { Copy } from 'lucide-react';
import { notify } from '../../../shared/ui/notify';
import type { Message } from '../api/types';

interface MessageBubbleProps {
  message: Message;
}

const safeUrlTransform = (url: string): string => {
  const transformed = defaultUrlTransform(url);
  const protocol = transformed.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase();

  if (!protocol || ['http', 'https', 'mailto'].includes(protocol)) {
    return transformed;
  }

  return '';
};

const markdownComponents: Components = {
  pre: ({ children }) => (
    <pre
      role="region"
      aria-label="Code block"
      tabIndex={0}
      className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-slate-950 p-4 text-sm text-slate-100"
    >
      {children}
    </pre>
  ),
  code: ({ className, children, ...props }) => {
    const isBlock = Boolean(className?.includes('language-') || className?.includes('hljs'));

    if (isBlock) {
      return (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }

    return (
      <code
        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-[rgb(var(--color-primary))]"
        {...props}
      >
        {children}
      </code>
    );
  },
};

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
            <div className="flex space-x-2 py-1" aria-label="Assistant is responding">
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
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeSanitize, rehypeHighlight]}
                urlTransform={safeUrlTransform}
                components={markdownComponents}
              >
                {message.content}
              </ReactMarkdown>
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
              type="button"
              onClick={() => {
                void handleCopy();
              }}
              aria-label="Copy message"
              title="Copy message"
              className="rounded-lg border border-white/10 bg-white/10 p-1.5 transition hover:bg-white/20 dark:bg-white/5"
            >
              <Copy size={16} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
