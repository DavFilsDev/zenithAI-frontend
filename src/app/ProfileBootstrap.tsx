import { useEffect, type ReactNode } from 'react';
import { useProfileQuery } from '../features/auth/model/useProfile';
import { useSessionStore } from '../shared/auth/sessionStore';
import { endSession } from '../shared/api/authInterceptor';
import { ApiError } from '../shared/api/apiError';

interface ProfileBootstrapProps {
  children: ReactNode;
}

export const ProfileBootstrap = ({ children }: ProfileBootstrapProps) => {
  const status = useSessionStore((state) => state.status);
  const profile = useProfileQuery(status !== 'anonymous');

  useEffect(() => {
    if (profile.data) {
      useSessionStore.getState().setUser(profile.data);
    }
  }, [profile.data]);

  useEffect(() => {
    if (!profile.error) {
      return;
    }

    if (
      profile.error instanceof ApiError &&
      (profile.error.status === 401 || profile.error.status === 403)
    ) {
      endSession();
      return;
    }

    const currentUser = useSessionStore.getState().user;
    useSessionStore.getState().setStatus(currentUser ? 'authenticated' : 'anonymous');
  }, [profile.error]);

  useEffect(() => {
    if (status === 'loading' && profile.isFetched && !profile.data && !profile.error) {
      useSessionStore.getState().setStatus('anonymous');
    }
  }, [status, profile.isFetched, profile.data, profile.error]);

  return <>{children}</>;
};
