import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConversationDetail, ConversationSummary, Message } from '../types/chat';
import { chatService } from '../services/chat';
import { ApiError } from '../services/apiError';
import { notify } from '../lib/notify';

interface ChatState {
    conversations: ConversationSummary[];
    currentConversation: ConversationDetail | null;
    isLoading: boolean;
    isSending: boolean;
    isDraft: boolean;

    loadConversations: () => Promise<void>;
    loadConversation: (uuid: string) => Promise<void>;
    sendMessage: (content: string, conversationUuid?: string) => Promise<void>;
    deleteConversation: (uuid: string) => Promise<void>;
    clearCurrentConversation: () => void;
    startNewChat: () => void;
    reset: () => void;
}

const titleFromMessage = (content: string): string =>
    content.trim().slice(0, 80) || 'New conversation';

const isRateLimited = (error: unknown): error is ApiError =>
    error instanceof ApiError &&
    (error.code === 'rate_limited' || error.code === 'quota_exhausted');

export const useChatStore = create<ChatState>()(
    persist(
        (set, get) => ({
            conversations: [],
            currentConversation: null,
            isLoading: false,
            isSending: false,
            isDraft: false,

            clearCurrentConversation: () => set({
                currentConversation: null,
                isDraft: false,
            }),

            startNewChat: () => {
                set({
                    currentConversation: null,
                    isDraft: true,
                });
            },

            reset: () => set({
                conversations: [],
                currentConversation: null,
                isLoading: false,
                isSending: false,
                isDraft: false,
            }),

            loadConversations: async () => {
                set({ isLoading: true });
                try {
                    const data = await chatService.getConversations();
                    set({ conversations: data });
                } catch (error) {
                    if (isRateLimited(error)) {
                        notify.rateLimit(error, () => get().loadConversations());
                    } else {
                        notify.error('Failed to load conversations');
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            loadConversation: async (uuid) => {
                set({ isLoading: true });
                try {
                    const data = await chatService.getConversation(uuid);
                    set({ currentConversation: data });
                } catch (error) {
                    if (isRateLimited(error)) {
                        notify.rateLimit(error, () => get().loadConversation(uuid));
                    } else {
                        notify.error('Failed to load conversation');
                    }
                } finally {
                    set({ isLoading: false });
                }
            },

            sendMessage: async (content, conversationUuid) => {
                if (!content.trim()) return;

                set({ isSending: true });

                const tempUuid = crypto.randomUUID();
                let targetUuid = conversationUuid ?? get().currentConversation?.uuid;

                try {
                    if (!targetUuid) {
                        const created = await chatService.createConversation(titleFromMessage(content));
                        targetUuid = created.uuid;
                        set({
                            currentConversation: { ...created, messages: [] },
                            isDraft: false,
                        });
                    }

                    const tempMessage: Message = {
                        uuid: tempUuid,
                        role: 'user',
                        content,
                        created_at: new Date().toISOString(),
                    };

                    set((state) => ({
                        currentConversation: state.currentConversation
                            ? {
                                ...state.currentConversation,
                                messages: [...state.currentConversation.messages, tempMessage],
                            }
                            : state.currentConversation,
                    }));

                    const response = await chatService.sendMessage(targetUuid, content);

                    set((state) => ({
                        currentConversation: state.currentConversation
                            ? {
                                ...state.currentConversation,
                                messages: [...state.currentConversation.messages, response],
                            }
                            : state.currentConversation,
                    }));

                    await get().loadConversations();
                    notify.success('Message sent!');
                } catch (error) {
                    if (isRateLimited(error)) {
                        set((state) => ({
                            currentConversation: state.currentConversation
                                ? {
                                    ...state.currentConversation,
                                    messages: state.currentConversation.messages.filter(
                                        (message) => message.uuid !== tempUuid
                                    ),
                                }
                                : state.currentConversation,
                        }));
                        notify.rateLimit(error, () => get().sendMessage(content, targetUuid));
                    } else {
                        notify.error('Failed to send message');

                        if (targetUuid) {
                            get().loadConversation(targetUuid);
                        }
                    }
                } finally {
                    set({ isSending: false });
                }
            },

            deleteConversation: async (uuid) => {
                try {
                    await chatService.deleteConversation(uuid);

                    set((state) => ({
                        conversations: state.conversations.filter((c) => c.uuid !== uuid),
                        currentConversation:
                            state.currentConversation?.uuid === uuid
                                ? null
                                : state.currentConversation,
                    }));

                    notify.success('Conversation deleted');
                } catch (error) {
                    if (isRateLimited(error)) {
                        notify.rateLimit(error, () => get().deleteConversation(uuid));
                    } else {
                        notify.error('Failed to delete conversation');
                    }
                }
            },
        }),
        {
            name: 'chat-storage',
            partialize: (state) => ({
                conversations: state.conversations,
            }),
        }
    )
);

export const resetChatStore = (): void => {
    useChatStore.getState().reset();
    void useChatStore.persist.clearStorage();
};
