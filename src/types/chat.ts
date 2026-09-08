export type ConversationType = 'DIRECT' | 'GROUP';

export type Conversation = {
  id: string;
  type: ConversationType;
  title?: string | null;
  createdBy?: string | null;
  memberIds: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type ConversationCreateRequest = {
  type: ConversationType;
  title?: string;
  memberIds: string[];
};

export type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
};

