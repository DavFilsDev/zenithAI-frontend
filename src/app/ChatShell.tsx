import { useState } from 'react';
import { useSessionStore } from '../shared/auth/sessionStore';
import { useLogout } from '../features/auth/model/useLogout';
import { useUpdateProfile } from '../features/auth/model/useProfile';
import { UserProfileModal } from '../features/auth/components/UserProfileModal';
import { Sidebar } from '../features/chat/components/Sidebar';
import { ChatPage } from '../features/chat/pages/ChatPage';

export const ChatShell = () => {
  const user = useSessionStore((state) => state.user);
  const logout = useLogout();
  const updateProfile = useUpdateProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar
        user={user}
        onLogout={() => {
          if (!logout.isPending) {
            logout.mutate();
          }
        }}
        onOpenProfile={() => setIsProfileOpen(true)}
      />
      <div className="flex-1 overflow-hidden">
        <ChatPage />
      </div>
      <UserProfileModal
        key={isProfileOpen ? 'open' : 'closed'}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={{
          email: user?.email ?? '',
          username: user?.username ?? '',
        }}
        onUpdateProfile={updateProfile.mutateAsync}
      />
    </div>
  );
};
