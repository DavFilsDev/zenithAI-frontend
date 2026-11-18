import { PanelLeft } from 'lucide-react';
import { useChatUiStore } from '../model/chatUiStore';
import type { Message } from '../api/types';
import { Composer } from './Composer';
import { MessageList } from './MessageList';

interface ChatWindowProps {
  title: string;
  messages: Message[];
  onSendMessage: (message: string) => void;
  onStop: () => void;
  isLoading?: boolean;
  isSending?: boolean;
  disabled?: boolean;
}

export const ChatWindow = ({
  title,
  messages,
  onSendMessage,
  onStop,
  isLoading = false,
  isSending = false,
  disabled = false,
}: ChatWindowProps) => {
  const isMobileDrawerOpen = useChatUiStore((state) => state.isMobileDrawerOpen);
  const openMobileDrawer = useChatUiStore((state) => state.openMobileDrawer);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-canvas">
      <header
        className="shrink-0 border-b border-border-subtle bg-canvas"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto flex h-12 w-full max-w-[720px] items-center gap-2 px-4 sm:px-6">
          <button
            id="sidebar-trigger"
            type="button"
            aria-label="Open sidebar"
            aria-expanded={isMobileDrawerOpen}
            aria-controls="app-sidebar"
            onClick={openMobileDrawer}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors duration-fast hover:bg-hover hover:text-text lg:hidden"
          >
            <PanelLeft size={20} strokeWidth={1.5} aria-hidden="true" />
          </button>
          <h2 className="truncate text-ui font-medium text-text">{title}</h2>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">
        <MessageList messages={messages} isLoading={isLoading} isSending={isSending} />
      </div>

      <div
        className="shrink-0 border-t border-border-subtle bg-canvas"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto w-full max-w-[720px] px-4 py-3 sm:px-6">
          <Composer
            onSendMessage={onSendMessage}
            onStop={onStop}
            isStreaming={isSending}
            disabled={disabled}
          />
        </div>
      </div>
    </div>
  );
};
