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
  isLoading,
  isSending,
  disabled,
}: ChatWindowProps) => {
  return (
    <div className="flex-1 flex flex-col h-full bg-[rgb(var(--color-bg))]">
      <div className="py-4 px-1 border-b bg-white/10 dark:bg-white/5 backdrop-blur-md border-white/10">
        <div className="max-w-3xl mx-auto w-full">
          <h2 className="font-semibold text-[rgb(var(--color-text))] truncate">{title}</h2>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-4xl mx-auto h-full px-4">
          <MessageList messages={messages} isLoading={isLoading} isSending={isSending} />
        </div>
      </div>

      <div className="w-full">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Composer onSendMessage={onSendMessage} disabled={disabled || isSending} />
        </div>
      </div>
    </div>
  );
};
