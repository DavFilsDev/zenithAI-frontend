import api from '../../../shared/api/apiClient';
import type {
  ConversationDetail,
  ConversationListPage,
  ConversationSummary,
} from './types';

export const conversationsApi = {
  async list(page = 1): Promise<ConversationListPage> {
    const response = await api.get<ConversationListPage>('/chat/conversations/', {
      params: { page },
    });
    return response.data;
  },

  async get(uuid: string): Promise<ConversationDetail> {
    const response = await api.get<ConversationDetail>(`/chat/conversations/${uuid}/`);
    return response.data;
  },

  async create(title: string): Promise<ConversationSummary> {
    const response = await api.post<ConversationSummary>('/chat/conversations/', { title });
    return response.data;
  },

  async update(uuid: string, title: string): Promise<ConversationSummary> {
    const response = await api.patch<ConversationSummary>(`/chat/conversations/${uuid}/`, {
      title,
    });
    return response.data;
  },

  async remove(uuid: string): Promise<void> {
    await api.delete(`/chat/conversations/${uuid}/`);
  },
};
