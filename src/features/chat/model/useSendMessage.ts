import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { conversationsApi } from '../api/conversationsApi';
import { streamMessage } from '../api/streamMessage';
import { conversationKeys } from '../api/queryKeys';
import { useChatUiStore } from './chatUiStore';
import { ApiError } from '../../../shared/api/apiError';
import { notify } from '../../../shared/ui/notify';
import type { ConversationDetail, Message } from '../api/types';

interface SendMessageVariables {
  conversationUuid?: string | undefined;
  content: string;
}

const titleFrom = (content: string): string => {
  const title = content.trim().replace(/\s+/g, ' ').slice(0, 60);
  return title || 'New conversation';
};

const temporaryMessage = (role: Message['role'], content: string): Message => ({
  uuid: `temp-${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
  created_at: new Date().toISOString(),
});

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isSending, setIsSending] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsSending(false);
  }, []);

  useEffect(() => () => abort(), [abort]);

  const send = useCallback(
    async ({ conversationUuid, content }: SendMessageVariables) => {
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;
      setIsSending(true);

      let targetUuid = conversationUuid;

      try {
        if (!targetUuid) {
          const conversation = await conversationsApi.create(titleFrom(content));

          if (controller.signal.aborted) {
            return;
          }

          targetUuid = conversation.uuid;
          queryClient.setQueryData<ConversationDetail>(conversationKeys.detail(targetUuid), {
            ...conversation,
            messages: [],
          });
          void queryClient.invalidateQueries({ queryKey: conversationKeys.all });
          void navigate(`/chat/${targetUuid}`, { replace: true });
        }

        if (!targetUuid) {
          return;
        }

        const uuid = targetUuid;

        await queryClient.cancelQueries({ queryKey: conversationKeys.messages(uuid) });

        if (controller.signal.aborted) {
          return;
        }

        const userMessage = temporaryMessage('user', content);
        const assistantMessage = temporaryMessage('assistant', '');

        queryClient.setQueryData<Message[]>(
          conversationKeys.messages(uuid),
          (messages = []) => [...messages, userMessage, assistantMessage]
        );

        let assistantContent = '';

        await streamMessage(uuid, content, {
          signal: controller.signal,
          onToken: (token) => {
            assistantContent += token;
            queryClient.setQueryData<Message[]>(
              conversationKeys.messages(uuid),
              (messages = []) =>
                messages.map((message) =>
                  message.uuid === assistantMessage.uuid
                    ? { ...message, content: assistantContent }
                    : message
                )
            );
          },
        });

        await Promise.all([
          queryClient.invalidateQueries({ queryKey: conversationKeys.messages(uuid) }),
          queryClient.invalidateQueries({ queryKey: conversationKeys.detail(uuid) }),
          queryClient.invalidateQueries({ queryKey: conversationKeys.all }),
        ]);
      } catch (error) {
        if (targetUuid) {
          queryClient.setQueryData<Message[]>(
            conversationKeys.messages(targetUuid),
            (messages = []) => messages.filter((message) => !message.uuid.startsWith('temp-'))
          );
          void queryClient.invalidateQueries({ queryKey: conversationKeys.messages(targetUuid) });
          void queryClient.invalidateQueries({ queryKey: conversationKeys.detail(targetUuid) });
        }

        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        if (
          error instanceof ApiError &&
          (error.code === 'rate_limited' || error.code === 'quota_exhausted')
        ) {
          useChatUiStore.getState().setDraft(content);
          notify.rateLimit(error, () => {
            void send({ conversationUuid: targetUuid, content });
          });
          return;
        }

        notify.error(error instanceof Error ? error.message : 'Failed to send message.');
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setIsSending(false);
        }
      }
    },
    [navigate, queryClient]
  );

  return { send, isSending, abort };
};
