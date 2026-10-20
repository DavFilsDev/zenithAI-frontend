import React, { useRef, useEffect } from 'react';
import type { Message } from '../../types/chat';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isSending?: boolean;
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
  isLoading, 
  isSending 
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
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
      {/* Render all messages */}
      {messages.map((message) => (
        <MessageBubble key={message.uuid} message={message} />
      ))}
      
      {/* Show typing indicator when sending */}
      {isSending && (
        <div className="flex justify-start mb-4">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
            <div className="flex space-x-2">
              <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-[rgb(var(--color-primary))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      )}
      
      {/* Loading indicator for older messages */}
      {isLoading && (
        <div className="flex justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[rgb(var(--color-primary))]" />
        </div>
      )}
      
      {/* Invisible element for scrolling to bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};