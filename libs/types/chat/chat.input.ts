export interface OpenConversationInput {
  appointmentId: string;
}

export interface ChatMessagesInput {
  conversationId: string;
  page: number;
  limit: number;
}

export interface SendChatMessageInput {
  conversationId: string;
  content: string;
}

export interface MarkChatReadInput {
  conversationId: string;
}

export interface UpdateChatMessageInput {
  messageId: string;
  content: string;
}

export interface DeleteChatMessageInput {
  messageId: string;
}
