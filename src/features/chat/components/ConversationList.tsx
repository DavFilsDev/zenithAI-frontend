import { useEffect, useMemo, useRef, useState } from 'react';
import { differenceInCalendarDays, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { Check, MessageSquare, Pencil, Trash2, X } from 'lucide-react';
import { Skeleton } from '../../../shared/ui/Skeleton';
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

type ConversationGroup = 'Today' | 'Yesterday' | 'Previous 7 days' | 'Older';

const groupLabels: ConversationGroup[] = ['Today', 'Yesterday', 'Previous 7 days', 'Older'];

const getGroup = (dateString: string): ConversationGroup => {
  const date = new Date(dateString);
  if (isToday(date)) return 'Today';
  if (isYesterday(date)) return 'Yesterday';
  const diff = differenceInCalendarDays(new Date(), date);
  if (diff >= 2 && diff <= 7) return 'Previous 7 days';
  return 'Older';
};

const actionButtonClassName =
  'flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-text-secondary transition-colors duration-fast hover:bg-hover hover:text-text';

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

  const grouped = useMemo(() => {
    const groups: Record<ConversationGroup, ConversationSummary[]> = {
      Today: [],
      Yesterday: [],
      'Previous 7 days': [],
      Older: [],
    };

    conversations.forEach((conversation) => {
      groups[getGroup(conversation.updated_at)].push(conversation);
    });

    return groupLabels
      .map((label) => ({ label, items: groups[label] }))
      .filter((group) => group.items.length > 0);
  }, [conversations]);

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
      <div
        role="status"
        aria-label="Loading conversations"
        className="flex-1 overflow-y-auto px-2 py-2"
      >
        <div className="space-y-1">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex h-9 items-center px-3">
              <Skeleton className="h-4 w-full" />
            </div>
          ))}
        </div>
        <span className="sr-only">Loading conversations</span>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div
        role="status"
        className="flex flex-1 flex-col items-center justify-center p-4 text-center text-text-secondary"
      >
        <MessageSquare size={20} strokeWidth={1.5} className="mb-2 opacity-50" aria-hidden="true" />
        <p className="text-body">No conversations yet</p>
        <p className="mt-1 text-small">Start a new chat to begin</p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div aria-label="Conversations" className="flex-1 overflow-y-auto px-2 py-2">
        {grouped.map((group) => (
          <section key={group.label} className="mb-3 last:mb-0">
            <h2 className="px-3 py-1 font-mono text-label text-text-tertiary">{group.label}</h2>
            <ul>
              {group.items.map((conversation) => {
                const conversationTitle = conversation.title || 'New Conversation';
                const isActive = activeUuid === conversation.uuid;

                return (
                  <li key={conversation.uuid} className="group relative">
                    {editingUuid === conversation.uuid ? (
                      <form
                        onSubmit={(event) => {
                          event.preventDefault();
                          saveTitle(conversation.uuid);
                        }}
                        className="flex h-9 items-center gap-1 px-2"
                      >
                        <input
                          ref={titleInputRef}
                          aria-label="Conversation title"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          className="min-w-0 flex-1 rounded-[var(--radius-sm)] border border-border bg-raised px-2 py-1 text-ui text-text outline-none focus:border-accent"
                        />
                        <button
                          type="submit"
                          title="Save title"
                          aria-label="Save title"
                          className={actionButtonClassName}
                        >
                          <Check size={14} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditing}
                          title="Cancel rename"
                          aria-label="Cancel rename"
                          className={actionButtonClassName}
                        >
                          <X size={14} strokeWidth={1.5} aria-hidden="true" />
                        </button>
                      </form>
                    ) : (
                      <div
                        className={`flex h-9 items-center rounded-[var(--radius-sm)] transition-colors duration-fast ${
                          isActive
                            ? 'border-l-2 border-accent bg-accent-subtle'
                            : 'border-l-2 border-transparent hover:bg-hover'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => onSelect(conversation.uuid)}
                          aria-current={isActive ? 'page' : undefined}
                          aria-label={`Open ${conversationTitle}`}
                          className="min-w-0 flex-1 px-3 py-1 text-left"
                        >
                          <span className="block truncate text-ui text-text">
                            {conversationTitle}
                          </span>
                          <span className="sr-only">
                            {formatDistanceToNow(new Date(conversation.updated_at), {
                              addSuffix: true,
                            })}
                          </span>
                        </button>
                        <div className="mr-1 flex items-center gap-0.5 opacity-100 [@media(hover:hover)_and_(pointer:fine)]:opacity-0 [@media(hover:hover)_and_(pointer:fine)]:group-focus-within:opacity-100 [@media(hover:hover)_and_(pointer:fine)]:group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => startEditing(conversation)}
                            title="Rename conversation"
                            aria-label={`Rename ${conversationTitle}`}
                            className={actionButtonClassName}
                          >
                            <Pencil size={14} strokeWidth={1.5} aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDelete(conversation.uuid)}
                            title="Delete conversation"
                            aria-label={`Delete ${conversationTitle}`}
                            className={`${actionButtonClassName} hover:text-danger`}
                          >
                            <Trash2 size={14} strokeWidth={1.5} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <nav
        aria-label="Conversation pages"
        className="flex items-center justify-between border-t border-border-subtle px-3 py-2 text-small text-text-secondary"
      >
        <button
          type="button"
          disabled={!hasPrevious}
          onClick={() => onPageChange(page - 1)}
          className="rounded-[var(--radius-sm)] px-2 py-1 transition-colors duration-fast hover:bg-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span>Page {page}</span>
        <button
          type="button"
          disabled={!hasNext}
          onClick={() => onPageChange(page + 1)}
          className="rounded-[var(--radius-sm)] px-2 py-1 transition-colors duration-fast hover:bg-hover hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </nav>
    </div>
  );
};
