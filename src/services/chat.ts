import api from './api';
import type {
  ConversationDetail,
  ConversationSummary,
  ConversationListPage,
  Message,
} from '../types/chat';

export const chatService = {
  async getConversations(): Promise<ConversationSummary[]> {
    const response = await api.get<ConversationListPage>('/chat/conversations/');
    return response.data.results;
  },

  async getConversation(uuid: string): Promise<ConversationDetail> {
    const response = await api.get<ConversationDetail>(`/chat/conversations/${uuid}/`);
    return response.data;
  },

  async createConversation(title: string): Promise<ConversationSummary> {
    const response = await api.post<ConversationSummary>('/chat/conversations/', { title });
    return response.data;
  },

  async sendMessage(conversationUuid: string, message: string): Promise<Message> {
    const response = await api.post<Message>(
      `/chat/conversations/${conversationUuid}/messages/`,
      { message }
    );
    return response.data;
  },

  async deleteConversation(uuid: string): Promise<void> {
    await api.delete(`/chat/conversations/${uuid}/`);
  },
};
