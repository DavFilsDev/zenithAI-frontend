import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { FiMessageSquare, FiTrash2, FiEdit2, FiCheck, FiX } from 'react-icons/fi';
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
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-transparent border-t-[rgb(var(--color-primary))]" />
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-4 text-center text-gray-400">
        <FiMessageSquare size={32} className="mb-2 opacity-50" />
        <p className="text-sm">No conversations yet</p>
        <p className="text-xs mt-1">Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        {conversations.map((conversation) => (
          <div
            key={conversation.uuid}
            className={`relative group p-3 mx-2 my-1 rounded-xl transition-all duration-200 ${
              activeUuid === conversation.uuid ? 'bg-white/10' : 'hover:bg-white/10 dark:hover:bg-white/5'
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
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  autoFocus
                  className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-2 py-1 text-sm outline-none focus:border-[rgb(var(--color-primary))]"
                />
                <button
                  type="submit"
                  title="Save title"
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <FiCheck size={14} />
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  title="Cancel rename"
                  className="p-1.5 rounded-lg hover:bg-white/10"
                >
                  <FiX size={14} />
                </button>
              </form>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => onSelect(conversation.uuid)}
                  className="w-full text-left"
                >
                  <div className="font-medium truncate pr-16">
                    {conversation.title || 'New Conversation'}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(new Date(conversation.updated_at), {
                      addSuffix: true,
                    })}
                  </div>
                </button>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => startEditing(conversation)}
                    title="Rename conversation"
                    className="p-1.5 rounded-lg hover:bg-white/10 hover:text-[rgb(var(--color-primary))]"
                  >
                    <FiEdit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(conversation.uuid)}
                    title="Delete conversation"
                    className="p-1.5 rounded-lg hover:bg-white/10 hover:text-red-500"
                  >
                    <FiTrash2 size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/10 px-3 py-2 text-xs">
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
      </div>
    </div>
  );
};
