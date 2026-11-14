import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiSidebar } from 'react-icons/fi';
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
  const [showTooltip, setShowTooltip] = useState(false);

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
      onClick={handleNewChat}
      className={`
        group relative w-full flex items-center justify-center gap-2
        bg-[rgb(var(--color-primary))/12]
        backdrop-blur-sm
        border-2 border-[rgb(var(--color-primary))]
        text-[rgb(var(--color-primary))]
        rounded-xl py-2
        hover:shadow-xl hover:shadow-[rgb(var(--color-primary))/30]
        hover:scale-[1.02] active:scale-[0.98]
        hover:bg-[rgb(var(--color-primary))/20]
        transition-all duration-300 ease-out
        overflow-hidden
        ${expanded ? 'px-1 font-semibold' : 'px-2'}
      `}
      title="New Chat"
    >
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-[rgb(var(--color-primary))/25] to-transparent" />
      <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
      <FiPlus
        size={expanded ? 18 : 20}
        className="transition-all duration-300 group-hover:rotate-90 group-hover:scale-110"
      />
      {expanded && <span className="text-sm font-bold tracking-wide">New Chat</span>}
    </button>
  );

  if (!isSidebarOpen) {
    return (
      <div className="w-16 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] border-r border-white/10 h-screen flex flex-col">
        <div className="p-4 border-b border-white/10">
          <h1 className="text-xl font-bold tracking-wide text-center">
            Z<span className="text-[rgb(var(--color-primary))]">A</span>
          </h1>
        </div>

        <div className="relative mx-auto">
          <button
            onClick={toggleSidebar}
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            className="p-2 mx-auto mt-2 rounded-lg hover:bg-white/10 transition-all duration-200"
          >
            <FiSidebar size={20} className="rotate-180" />
          </button>
          {showTooltip && (
            <div className="absolute left-full top-[60%] -translate-y-1/2 ml-2 px-2 py-1 text-xs bg-gray-900 text-white border border-white/20 rounded whitespace-nowrap">
              Expand sidebar (Ctrl+B)
            </div>
          )}
        </div>

        <div className="p-3">{newChatButton(false)}</div>

        <div className="flex-1" />

        <div className="p-3 space-y-3 border-t border-white/10">
          <SettingsDropdown
            theme={theme}
            onToggleTheme={toggleTheme}
            onLogout={onLogout}
            variant="icon"
          />
          <UserButton variant="icon" onClick={onOpenProfile} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] border-r border-white/10 h-screen flex flex-col">
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

      <div className="p-4 border-t border-white/10 space-y-2">
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
    </div>
  );
};
