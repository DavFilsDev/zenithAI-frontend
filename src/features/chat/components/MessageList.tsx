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
  const lastMessage = messages[messages.length - 1];
  const showTyping =
    isSending && !(lastMessage?.role === 'assistant' && lastMessage.content === '');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: isSending ? 'auto' : 'smooth' });
  }, [messages, isSending]);

  if (messages.length === 0 && !isLoading) {
    return (
      <div role="status" className="flex flex-1 items-center justify-center p-8">
        <div className="text-center text-[rgb(var(--color-text))] opacity-60">
          <p className="mb-2 text-lg">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message below!</p>
        </div>
      </div>
    );
  }

  return (
    <div
      role="log"
      aria-label="Conversation messages"
      aria-live="polite"
      aria-relevant="additions text"
      aria-busy={isSending || undefined}
      className="flex-1 space-y-4 overflow-y-auto p-4"
    >
      {messages.map((message) => (
        <MessageBubble key={message.uuid} message={message} />
      ))}

      {showTyping && (
        <div className="flex justify-start">
          <div role="status" className="rounded-xl bg-white/10 p-4 backdrop-blur-md">
            <div className="flex space-x-2" aria-hidden="true">
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--color-primary))]"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--color-primary))]"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="h-2 w-2 animate-bounce rounded-full bg-[rgb(var(--color-primary))]"
                style={{ animationDelay: '300ms' }}
              />
            </div>
            <span className="sr-only">Assistant is responding</span>
          </div>
        </div>
      )}

      {isLoading && (
        <div role="status" className="flex justify-center p-4">
          <div
            aria-hidden="true"
            className="h-6 w-6 animate-spin rounded-full border-b-2 border-[rgb(var(--color-primary))]"
          />
          <span className="sr-only">Loading messages</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
