import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../shared/ui/useTheme';
import { notify } from '../../../shared/ui/notify';
import type { User } from '../../../shared/api/types';
import { useChatUiStore } from '../model/chatUiStore';
import {
  useConversations,
  useDeleteConversation,
  useRenameConversation,
} from '../model/useConversations';
import { ConversationList } from './ConversationList';
import { SidebarHeader } from './SidebarHeader';
import { SettingsDropdown } from './SettingsDropdown';
import { UserButton } from './UserButton';

interface SidebarProps {
  user: User | null;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Sidebar = ({ user, onLogout, onOpenProfile }: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { uuid: activeUuid } = useParams<{ uuid: string }>();
  const isSidebarOpen = useChatUiStore((state) => state.isSidebarOpen);
  const toggleSidebar = useChatUiStore((state) => state.toggleSidebar);
  const setDraft = useChatUiStore((state) => state.setDraft);
  const conversationPage = useChatUiStore((state) => state.conversationPage);
  const setConversationPage = useChatUiStore((state) => state.setConversationPage);
  const conversationsQuery = useConversations();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();

  const handleNewChat = () => {
    setDraft('');
    setConversationPage(1);
    void navigate('/chat');
  };

  const handleSelect = (uuid: string) => {
    void navigate(`/chat/${uuid}`);
  };

  const handleDelete = async (uuid: string) => {
    if (!window.confirm('Are you sure you want to delete this conversation?')) {
      return;
    }

    try {
      await deleteConversation.mutateAsync(uuid);

      if (activeUuid === uuid) {
        void navigate('/chat', { replace: true });
      }

      if (conversationPage > 1 && conversationsQuery.data?.results.length === 1) {
        setConversationPage(conversationPage - 1);
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed to delete conversation.');
    }
  };

  const handleRename = async (uuid: string, title: string) => {
    try {
      await renameConversation.mutateAsync({ uuid, title });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed to rename conversation.');
    }
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        toggleSidebar();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSidebar]);

  const newChatButton = (expanded: boolean) => (
    <button
      type="button"
      onClick={handleNewChat}
      aria-label="New chat"
      className={`group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-accent bg-accent/10 py-2 text-accent-text backdrop-blur-sm transition-all duration-300 ease-out hover:scale-[1.02] hover:bg-accent/20 hover:shadow-xl hover:shadow-accent/30 active:scale-[0.98] ${expanded ? 'px-1 font-semibold' : 'px-2'} `}
      title="New Chat"
    >
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-accent/25 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
      <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
      <Plus
        size={20}
        strokeWidth={1.5}
        className="transition-all duration-300 group-hover:scale-110 group-hover:rotate-90"
      />
      {expanded && <span className="text-sm font-bold tracking-wide">New Chat</span>}
    </button>
  );

  if (!isSidebarOpen) {
    return (
      <aside
        aria-label="Sidebar"
        className="flex h-dvh w-16 shrink-0 flex-col border-r border-white/10 bg-canvas text-text"
      >
        <SidebarHeader isOpen={false} onToggle={toggleSidebar} compact />

        <div className="p-3">{newChatButton(false)}</div>

        <div className="flex-1" />

        <div className="space-y-3 border-t border-white/10 p-3">
          <SettingsDropdown
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={onLogout}
            variant="icon"
          />
          <UserButton variant="icon" onClick={onOpenProfile} />
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Sidebar"
      className="flex h-dvh w-64 shrink-0 flex-col border-r border-white/10 bg-canvas text-text"
    >
      <SidebarHeader isOpen={isSidebarOpen} onToggle={toggleSidebar} />

      <div className="p-4">{newChatButton(true)}</div>

      <ConversationList
        conversations={conversationsQuery.data?.results ?? []}
        activeUuid={activeUuid}
        isLoading={conversationsQuery.isLoading}
        page={conversationPage}
        hasNext={Boolean(conversationsQuery.data?.next)}
        hasPrevious={Boolean(conversationsQuery.data?.previous)}
        onSelect={handleSelect}
        onDelete={(uuid) => {
          void handleDelete(uuid);
        }}
        onRename={(uuid, title) => {
          void handleRename(uuid, title);
        }}
        onPageChange={setConversationPage}
      />

      <div className="space-y-2 border-t border-white/10 p-4">
        <SettingsDropdown
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={onLogout}
          variant="full"
        />
        <UserButton
          username={user?.username || user?.email?.split('@')[0]}
          onClick={onOpenProfile}
          variant="full"
        />
      </div>
    </aside>
  );
};
