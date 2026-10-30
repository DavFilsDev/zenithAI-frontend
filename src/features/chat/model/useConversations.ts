import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { conversationsApi } from '../api/conversationsApi';
import { conversationKeys } from '../api/queryKeys';
import { useChatUiStore } from './chatUiStore';
import { notify } from '../../../shared/ui/notify';
import type { ConversationDetail } from '../api/types';

export const useConversations = () => {
  const page = useChatUiStore((state) => state.conversationPage);

  return useQuery({
    queryKey: conversationKeys.list(page),
    queryFn: () => conversationsApi.list(page),
    placeholderData: keepPreviousData,
  });
};

export const useRenameConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ uuid, title }: { uuid: string; title: string }) =>
      conversationsApi.update(uuid, title),
    onSuccess: (conversation) => {
      queryClient.setQueryData<ConversationDetail>(
        conversationKeys.detail(conversation.uuid),
        (current) => (current ? { ...current, ...conversation } : current)
      );
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      queryClient.invalidateQueries({ queryKey: conversationKeys.detail(conversation.uuid) });
      notify.success('Conversation renamed.');
    },
  });
};

export const useDeleteConversation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uuid: string) => conversationsApi.remove(uuid),
    onSuccess: (_data, uuid) => {
      queryClient.removeQueries({ queryKey: conversationKeys.detail(uuid) });
      queryClient.removeQueries({ queryKey: conversationKeys.messages(uuid) });
      queryClient.invalidateQueries({ queryKey: conversationKeys.all });
      notify.success('Conversation deleted.');
    },
  });
};
