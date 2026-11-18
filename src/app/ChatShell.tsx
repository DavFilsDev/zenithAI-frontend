import { useCallback, useState } from 'react';
import { useSessionStore } from '../shared/auth/sessionStore';
import { useLogout } from '../features/auth/model/useLogout';
import { useUpdateProfile } from '../features/auth/model/useProfile';
import { SkipLink } from '../shared/ui/SkipLink';
import { UserProfileModal } from '../features/auth/components/UserProfileModal';
import { Sidebar } from '../features/chat/components/Sidebar';
import { ChatPage } from '../features/chat/pages/ChatPage';
import { ServiceStatus } from '../features/status/components/ServiceStatus';

export const ChatShell = () => {
  const user = useSessionStore((state) => state.user);
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const closeProfile = useCallback(() => setIsProfileOpen(false), []);

  return (
    <div className="flex h-dvh overflow-hidden bg-canvas text-text">
      <SkipLink />
      <ServiceStatus />
      <Sidebar
        user={user}
        onLogout={() => {
          if (!logout.isPending) {
            logout.mutate();
          }
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      <main id="main" className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <ChatPage />
      </main>
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={closeProfile}
        user={{
          email: user?.email ?? '',
          username: user?.username ?? '',
        }}
        onUpdateProfile={updateProfile.mutateAsync}
      />
    </div>
  );
};
