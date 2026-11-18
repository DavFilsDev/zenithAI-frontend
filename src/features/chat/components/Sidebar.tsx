import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useTheme } from '../../../shared/ui/useTheme';
import { notify } from '../../../shared/ui/notify';
import { ConfirmDialog } from '../../../shared/ui/ConfirmDialog';
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

const SIDEBAR_ID = 'app-sidebar';
const SIDEBAR_TRIGGER_ID = 'sidebar-trigger';

const isDesktopViewport = () => window.matchMedia('(min-width: 1024px)').matches;

export const Sidebar = ({ user, onLogout, onOpenProfile }: SidebarProps) => {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { uuid: activeUuid } = useParams<{ uuid: string }>();
  const [pendingDeleteUuid, setPendingDeleteUuid] = useState<string | null>(null);
  const isDesktopSidebarExpanded = useChatUiStore((state) => state.isDesktopSidebarExpanded);
  const isMobileDrawerOpen = useChatUiStore((state) => state.isMobileDrawerOpen);
  const toggleDesktopSidebar = useChatUiStore((state) => state.toggleDesktopSidebar);
  const closeMobileDrawer = useChatUiStore((state) => state.closeMobileDrawer);
  const setDraft = useChatUiStore((state) => state.setDraft);
  const conversationPage = useChatUiStore((state) => state.conversationPage);
  const setConversationPage = useChatUiStore((state) => state.setConversationPage);
  const conversationsQuery = useConversations();
  const deleteConversation = useDeleteConversation();
  const renameConversation = useRenameConversation();

  const handleNewChat = () => {
    setDraft('');
    setConversationPage(1);
    closeMobileDrawer();
    void navigate('/chat');
  };

  const handleSelect = (uuid: string) => {
    closeMobileDrawer();
    void navigate(`/chat/${uuid}`);
  };

  const requestDelete = (uuid: string) => {
    setPendingDeleteUuid(uuid);
  };

  const handleDelete = async () => {
    if (!pendingDeleteUuid) {
      return;
    }

    const uuid = pendingDeleteUuid;

    try {
      await deleteConversation.mutateAsync(uuid);
      setPendingDeleteUuid(null);

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
    closeMobileDrawer();
  }, [location.pathname, closeMobileDrawer]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault();
        if (isDesktopViewport()) {
          toggleDesktopSidebar();
        } else {
          useChatUiStore.setState((state) => ({
            isMobileDrawerOpen: !state.isMobileDrawerOpen,
          }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleDesktopSidebar]);

  useEffect(() => {
    if (!isMobileDrawerOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileDrawer();
        document.getElementById(SIDEBAR_TRIGGER_ID)?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobileDrawerOpen, closeMobileDrawer]);

  const closeDrawerWithFocusReturn = () => {
    closeMobileDrawer();
    document.getElementById(SIDEBAR_TRIGGER_ID)?.focus();
  };

  const newChatButton = (expanded: boolean) => (
    <button
      type="button"
      onClick={handleNewChat}
      aria-label="New chat"
      title="New chat"
      className={`flex w-full items-center justify-center gap-2 rounded-[var(--radius)] border border-border bg-surface py-2 text-ui text-text transition-colors duration-fast hover:bg-hover ${expanded ? 'px-3' : 'px-2'}`}
    >
      <Plus size={20} strokeWidth={1.5} aria-hidden="true" />
      {expanded && <span>New chat</span>}
    </button>
  );

  const sidebarBody = (expanded: boolean, onToggle: () => void) => (
    <>
      <SidebarHeader
        isOpen={expanded}
        onToggle={onToggle}
        compact={!expanded}
        controlsId={SIDEBAR_ID}
      />

      <div className={expanded ? 'p-4' : 'p-3'}>{newChatButton(expanded)}</div>

      {expanded ? (
        <ConversationList
          conversations={conversationsQuery.data?.results ?? []}
          activeUuid={activeUuid}
          isLoading={conversationsQuery.isLoading}
          page={conversationPage}
          hasNext={Boolean(conversationsQuery.data?.next)}
          hasPrevious={Boolean(conversationsQuery.data?.previous)}
          onSelect={handleSelect}
          onDelete={requestDelete}
          onRename={(uuid, title) => {
            void handleRename(uuid, title);
          }}
          onPageChange={setConversationPage}
        />
      ) : (
        <div className="flex-1" />
      )}

      <div
        className={`border-t border-border-subtle ${expanded ? 'space-y-2 p-4' : 'space-y-3 p-3'}`}
      >
        <SettingsDropdown
          theme={theme}
          onToggleTheme={toggleTheme}
          onLogout={onLogout}
          variant={expanded ? 'full' : 'icon'}
        />
        <UserButton
          username={user?.username || user?.email?.split('@')[0]}
          onClick={onOpenProfile}
          variant={expanded ? 'full' : 'icon'}
        />
      </div>
    </>
  );

  return (
    <>
      <aside
        id={SIDEBAR_ID}
        aria-label="Sidebar"
        className={`hidden h-dvh shrink-0 flex-col border-r border-border-subtle bg-surface text-text lg:flex ${isDesktopSidebarExpanded ? 'w-[280px]' : 'w-14'}`}
      >
        {sidebarBody(isDesktopSidebarExpanded, toggleDesktopSidebar)}
      </aside>

      {isMobileDrawerOpen ? (
        <div className="fixed inset-0 z-[var(--z-index-scrim)] lg:hidden">
          <button
            type="button"
            aria-label="Close sidebar"
            className="absolute inset-0 animate-fade-in"
            style={{ backgroundColor: 'rgb(0 0 0 / 0.5)' }}
            onClick={closeDrawerWithFocusReturn}
          />
          <aside
            aria-label="Sidebar"
            className="relative flex h-dvh w-[min(320px,85vw)] animate-drawer flex-col border-r border-border-subtle bg-surface text-text"
          >
            {sidebarBody(true, closeDrawerWithFocusReturn)}
          </aside>
        </div>
      ) : null}
      <ConfirmDialog
        open={pendingDeleteUuid !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPendingDeleteUuid(null);
          }
        }}
        title="Delete conversation?"
        description="This will permanently delete this conversation and its messages."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        confirming={deleteConversation.isPending}
      />
    </>
  );
};
