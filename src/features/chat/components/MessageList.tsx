import { useEffect, useRef } from 'react';
import type { Message } from '../api/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isSending?: boolean;
}

export const MessageList = ({ messages, isLoading, isSending }: MessageListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isSending ? 'auto' : 'smooth' });
  }, [messages, isSending]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div role="status" className="flex h-full items-center justify-center px-4 sm:px-6">
        <div className="mx-auto w-full max-w-[720px] text-center text-text-secondary">
          <p className="mb-2 text-body">No messages yet</p>
          <p className="text-small">Start a conversation by sending a message below.</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="log"
      aria-label="Conversation messages"
      aria-live={isSending ? 'off' : 'polite'}
      aria-relevant="additions text"
      aria-busy={isSending || undefined}
      className="h-full overflow-y-auto"
    >
      <div className="mx-auto w-full max-w-[720px] space-y-8 px-4 py-4 sm:px-6">
        {messages.map((message) => (
          <MessageBubble key={message.uuid} message={message} />
        ))}

        {isLoading && (
          <div role="status" className="flex justify-center p-4">
            <div
              aria-hidden="true"
              className="h-6 w-6 animate-spin rounded-full border-b-2 border-accent"
            />
            <span className="sr-only">Loading messages</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};
