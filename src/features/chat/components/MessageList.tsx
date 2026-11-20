import { useEffect, useRef, useState } from 'react';
import type { Message } from '../api/types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  isSending?: boolean;
}

export const MessageList = ({ messages, isLoading, isSending }: MessageListProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const wasSendingRef = useRef(false);
  const [completionAnnouncement, setCompletionAnnouncement] = useState('');

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) {
      return;
    }

    element.scrollTo({
      top: element.scrollHeight,
      behavior: isSending ? 'auto' : 'smooth',
    });
  }, [messages, isSending]);

  useEffect(() => {
    const wasSending = wasSendingRef.current;
    wasSendingRef.current = Boolean(isSending);

    if (wasSending && !isSending) {
      const lastMessage = messages[messages.length - 1];
      if (
        lastMessage?.role === 'assistant' &&
        lastMessage.content.trim() !== '' &&
        !lastMessage.uuid.startsWith('temp-')
      ) {
        queueMicrotask(() => setCompletionAnnouncement('Response complete'));
        return;
      }
    }

    if (isSending) {
      queueMicrotask(() => setCompletionAnnouncement(''));
    }
  }, [isSending, messages]);

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

  const streamingUuid =
    isSending && messages[messages.length - 1]?.role === 'assistant'
      ? messages[messages.length - 1]?.uuid
      : undefined;

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Conversation messages"
      aria-live="off"
      aria-relevant="additions text"
      aria-busy={isSending || undefined}
      className="h-full overflow-y-auto overscroll-contain"
    >
      <div className="mx-auto w-full max-w-[720px] space-y-8 px-4 py-4 sm:px-6">
        {messages.map((message) => (
          <MessageBubble
            key={message.uuid}
            message={message}
            isStreaming={message.uuid === streamingUuid}
          />
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
      </div>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {completionAnnouncement}
      </div>
    </div>
  );
};
