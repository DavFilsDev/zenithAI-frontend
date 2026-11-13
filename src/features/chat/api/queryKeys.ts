export const conversationKeys = {
  all: ['conversations'] as const,
  list: (page: number) => ['conversations', 'list', page] as const,
  detail: (uuid: string) => ['conversation', uuid] as const,
  messages: (uuid: string) => ['messages', uuid] as const,
};
