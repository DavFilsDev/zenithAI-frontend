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
      <div className="flex h-full min-h-0 flex-1 flex-col bg-canvas">
        <div className="flex flex-1 items-center justify-center px-4 sm:px-6">
          <div className="w-full max-w-[720px] text-center">
            <h2 className="mb-2 text-h2 text-text">What's on your mind?</h2>
            <p className="mb-6 text-body text-text-secondary">
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
