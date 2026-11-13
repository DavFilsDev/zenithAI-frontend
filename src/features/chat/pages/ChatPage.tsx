import { useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useConversation, useMessages } from '../model/useConversation';
import { useSendMessage } from '../model/useSendMessage';
import { ChatWindow } from '../components/ChatWindow';
import { Composer } from '../components/Composer';

export const ChatPage = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const { data: conversation } = useConversation(uuid);
  const { data: messages = [], isLoading } = useMessages(uuid);
  const { send, isSending, abort } = useSendMessage();
  const activeUuidRef = useRef<string | undefined>(uuid);

  useEffect(() => {
    if (activeUuidRef.current && uuid !== activeUuidRef.current) {
      abort();
    }

    activeUuidRef.current = uuid;
  }, [uuid, abort]);

  const handleSend = (content: string) => {
    void send({ conversationUuid: uuid, content });
  };

  if (!uuid) {
    return (
      <div className="flex-1 flex flex-col h-full bg-[rgb(var(--color-bg))]">
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-xl w-full">
            <h2 className="text-2xl font-semibold mb-2">What's on your mind?</h2>
            <p className="opacity-60 mb-6">
              Ask anything about your code — debugging, optimization, best practices
            </p>
            <Composer onSendMessage={handleSend} disabled={isSending} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <ChatWindow
      title={conversation?.title ?? 'Conversation'}
      messages={messages}
      onSendMessage={handleSend}
      isLoading={isLoading}
      isSending={isSending}
      disabled={isSending}
    />
  );
};
