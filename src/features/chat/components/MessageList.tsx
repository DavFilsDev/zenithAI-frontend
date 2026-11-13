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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-[rgb(var(--color-text))] opacity-60">
          <p className="text-lg mb-2">No messages yet</p>
          <p className="text-sm">Start a conversation by sending a message below!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <MessageBubble key={message.uuid} message={message} />
      ))}

      {showTyping && (
        <div className="flex justify-start mb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <div className="flex space-x-2">
              <div
                className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce"
                style={{ animationDelay: '0ms' }}
              />
              <div
                className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce"
                style={{ animationDelay: '150ms' }}
              />
              <div
                className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce"
                style={{ animationDelay: '300ms' }}
              />
            </div>
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(var(--color-primary))]" />
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};
