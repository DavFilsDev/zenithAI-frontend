import { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Check, MessageSquare, Pencil, Trash2, X } from 'lucide-react';
import type { ConversationSummary } from '../api/types';

interface ConversationListProps {
  conversations: ConversationSummary[];
  activeUuid?: string | undefined;
  isLoading: boolean;
  page: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onSelect: (uuid: string) => void;
  onDelete: (uuid: string) => void;
  onRename: (uuid: string, title: string) => void;
  onPageChange: (page: number) => void;
}

export const ConversationList = ({
  conversations,
  activeUuid,
  isLoading,
  page,
  hasNext,
  hasPrevious,
  onSelect,
  onDelete,
  onRename,
  onPageChange,
}: ConversationListProps) => {
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingUuid) {
      titleInputRef.current?.focus();
    }
  }, [editingUuid]);

  const startEditing = (conversation: ConversationSummary) => {
    setEditingUuid(conversation.uuid);
    setTitle(conversation.title);
  };

  const cancelEditing = () => {
    setEditingUuid(null);
    setTitle('');
  };

  const saveTitle = (uuid: string) => {
    const nextTitle = title.trim();

    if (nextTitle) {
      onRename(uuid, nextTitle);
    }

    cancelEditing();
  };

  if (isLoading) {
    return (
      <div role="status" className="flex flex-1 items-center justify-center p-4">
        <div
          aria-hidden="true"
          className="h-6 w-6 animate-spin rounded-full border-2 border-transparent border-t-accent"
        />
        <span className="sr-only">Loading conversations</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center p-4 text-center text-gray-400"
      >
        <MessageSquare size={20} strokeWidth={1.5} className="mb-2 opacity-50" aria-hidden="true" />
        <p className="text-sm">No conversations yet</p>
        <p className="mt-1 text-xs">Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <ul aria-label="Conversations" className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => {
          const conversationTitle = conversation.title || 'New Conversation';

          return (
            <li
              key={conversation.uuid}
              className={`group relative mx-2 my-1 rounded-xl p-3 transition-all duration-200 ${
                activeUuid === conversation.uuid
                  ? 'bg-white/10'
                  : 'hover:bg-white/10 dark:hover:bg-white/5'
              }`}
            >
              {editingUuid === conversation.uuid ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    saveTitle(conversation.uuid);
                  }}
                  className="flex items-center gap-1"
                >
                  <input
                    ref={titleInputRef}
                    aria-label="Conversation title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm outline-none focus:border-accent"
                  />
                  <button
                    type="submit"
                    title="Save title"
                    aria-label="Save title"
                    className="rounded-lg p-1.5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
                  >
                    <Check size={14} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    title="Cancel rename"
                    aria-label="Cancel rename"
                    className="rounded-lg p-1.5 hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
                  >
                    <X size={14} strokeWidth={1.5} aria-hidden="true" />
                  </button>
                </form>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => onSelect(conversation.uuid)}
                    aria-current={activeUuid === conversation.uuid ? 'page' : undefined}
                    aria-label={`Open ${conversationTitle}`}
                    className="w-full rounded-lg text-left focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
                  >
                    <div className="truncate pr-16 font-medium">{conversationTitle}</div>
                    <div className="mt-1 text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conversation.updated_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </button>
                  <div className="absolute top-1/2 right-2 flex -translate-y-1/2 items-center gap-1 opacity-0 transition group-focus-within:opacity-100 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEditing(conversation)}
                      title="Rename conversation"
                      aria-label={`Rename ${conversationTitle}`}
                      className="rounded-lg p-1.5 hover:bg-white/10 hover:text-accent-text focus-visible:ring-2 focus-visible:ring-accent-text focus-visible:outline-none"
                    >
                      <Pencil size={14} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(conversation.uuid)}
                      title="Delete conversation"
                      aria-label={`Delete ${conversationTitle}`}
                      className="rounded-lg p-1.5 hover:bg-white/10 hover:text-red-500 focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:outline-none"
                    >
                      <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ul>

      <nav
        aria-label="Conversation pages"
        className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-xs"
      >
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-40"
        >
          Previous
        </button>
        <span className="opacity-60">Page {page}</span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg px-2 py-1 hover:bg-white/10 disabled:opacity-40"
        >
          Next
        </button>
      </nav>
    </div>
  );
};
