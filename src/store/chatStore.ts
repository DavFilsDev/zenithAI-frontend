import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ConversationDetail, ConversationSummary, Message } from '../types/chat';
import { chatService } from '../services/chat';
import toast from 'react-hot-toast';

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
}

const titleFromMessage = (content: string): string =>
    content.trim().slice(0, 80) || 'New conversation';

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

            loadConversations: async () => {
                set({ isLoading: true });
                try {
                    const data = await chatService.getConversations();
                    set({ conversations: data });
                } catch (error) {
                    console.error('Failed to load conversations:', error);
                    toast.error('Failed to load conversations');
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
                    console.error('Failed to load conversation:', error);
                    toast.error('Failed to load conversation');
                } finally {
                    set({ isLoading: false });
                }
            },

            sendMessage: async (content, conversationUuid) => {
                if (!content.trim()) return;

                set({ isSending: true });

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
                        uuid: crypto.randomUUID(),
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
                    toast.success('Message sent!');
                } catch (error) {
                    console.error('Failed to send message:', error);
                    toast.error('Failed to send message');

                    if (targetUuid) {
                        get().loadConversation(targetUuid);
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

                    toast.success('Conversation deleted');
                } catch (error) {
                    console.error('Failed to delete conversation:', error);
                    toast.error('Failed to delete conversation');
                }
            },

            startNewChat: () => {
                set({
                    currentConversation: null,
                    isDraft: true,
                });
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
