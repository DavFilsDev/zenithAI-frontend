import { useQuery } from '@tanstack/react-query';
import { conversationsApi } from '../api/conversationsApi';
import { messagesApi } from '../api/messagesApi';
import { conversationKeys } from '../api/queryKeys';

export const useConversation = (uuid?: string) => {
  return useQuery({
    queryKey: conversationKeys.detail(uuid ?? ''),
    queryFn: () => conversationsApi.get(uuid as string),
    enabled: Boolean(uuid),
  });
};

export const useMessages = (uuid?: string) => {
  return useQuery({
    queryKey: conversationKeys.messages(uuid ?? ''),
    queryFn: () => messagesApi.listAll(uuid as string),
    enabled: Boolean(uuid),
  });
};
