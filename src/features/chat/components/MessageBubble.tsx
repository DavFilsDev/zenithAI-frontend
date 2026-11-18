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
        className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.9em] text-accent-text"
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

  const timestamp = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const meta = !isTyping ? (
    <div className="flex items-center gap-2">
      <time
        dateTime={message.created_at}
        className="font-mono text-small text-text-tertiary opacity-0 transition-opacity duration-fast group-focus-within:opacity-100 group-hover:opacity-100"
      >
        {timestamp}
      </time>
      <div className="opacity-0 transition-opacity duration-fast group-focus-within:opacity-100 group-hover:opacity-100 [@media(pointer:coarse)]:opacity-60">
        <button
          type="button"
          onClick={() => {
            void handleCopy();
          }}
          aria-label="Copy message"
          title="Copy message"
          className="flex h-8 w-8 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors duration-fast hover:bg-hover hover:text-text"
        >
          <Copy size={16} strokeWidth={1.5} aria-hidden="true" />
        </button>
      </div>
    </div>
  ) : null;

  if (isUser) {
    return (
      <article className="group flex justify-end">
        <div className="flex max-w-[80%] flex-col items-end gap-2">
          <div className="rounded-[var(--radius)] border border-border bg-raised px-4 py-3 text-body text-text">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>
          {meta}
        </div>
      </article>
    );
  }

  return (
    <article className="group flex w-full flex-col gap-2">
      {isTyping ? (
        <div className="flex space-x-2 py-1" aria-label="Assistant is responding">
          <div className="h-2 w-2 animate-bounce rounded-full bg-accent" />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-accent"
            style={{ animationDelay: '150ms' }}
          />
          <div
            className="h-2 w-2 animate-bounce rounded-full bg-accent"
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
      {meta}
    </article>
  );
};
