import type { Message } from '../api/types';
import { MessageList } from './MessageList';
import { Composer } from './Composer';

interface ChatWindowProps {
  title: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isSending?: boolean;
  disabled?: boolean;
}

export const ChatWindow = ({
  title,
  messages,
  onSendMessage,
  isLoading = false,
  isSending = false,
  disabled = false,
}: ChatWindowProps) => {
  return (
    <div className="flex h-full flex-1 flex-col bg-[rgb(var(--color-bg))]">
      <div className="border-b border-white/10 bg-white/10 px-1 py-4 backdrop-blur-md dark:bg-white/5">
        <div className="mx-auto w-full max-w-3xl">
          <h2 className="truncate font-semibold text-[rgb(var(--color-text))]">{title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="mx-auto h-full max-w-4xl px-4">
          <MessageList messages={messages} isLoading={isLoading} isSending={isSending} />
        </div>
      </div>

      <div className="w-full">
        <div className="mx-auto w-full max-w-4xl px-4">
          <Composer onSendMessage={onSendMessage} disabled={disabled || isSending} />
        </div>
      </div>
    </div>
  );
};
