import api from '../../../shared/api/apiClient';
import type { Message, MessageListPage } from './types';

export const messagesApi = {
  async list(uuid: string, page = 1): Promise<MessageListPage> {
    const response = await api.get<MessageListPage>(
      `/chat/conversations/${uuid}/messages/`,
      { params: { page } }
    );
    return response.data;
  },

  async listAll(uuid: string): Promise<Message[]> {
    const messages: Message[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const data = await messagesApi.list(uuid, page);
      messages.push(...data.results);
      hasNext = Boolean(data.next);
      page += 1;
    }

    return messages;
  },
};
