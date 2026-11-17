import api from '../../../shared/api/apiClient';
import type { Health } from '../../../shared/api/types';

export const healthApi = {
  async getHealth(): Promise<Health> {
    const response = await api.get<Health>('/health/');
    return response.data;
  },
};
