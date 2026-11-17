import { useQuery } from '@tanstack/react-query';
import { healthApi } from '../api/healthApi';
import { statusKeys } from '../api/queryKeys';

const RETRY_INTERVAL = 5_000;

export const useServiceHealth = () =>
  useQuery({
    queryKey: statusKeys.health,
    queryFn: () => healthApi.getHealth(),
    retry: false,
    staleTime: 0,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    refetchInterval: (query) => {
      const data = query.state.data;
      return data?.status === 'ok' && data.database === 'ok' ? false : RETRY_INTERVAL;
    },
  });
