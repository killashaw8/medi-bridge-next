import { Member } from "@/libs/types/member/member";

export interface ChatConversation {
  _id: string;
  appointmentId?: string | null;
  doctorId: string;
  patientId: string;
  lastMessageText?: string | null;
  lastMessageAt?: string | null;
  unreadCount?: number;
  createdAt: string;
  updatedAt: string;
  doctor?: Member;
  patient?: Member;
}

export interface ChatMessage {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string;
  readBy: string[];
  isDeleted: boolean;
  editedAt?: string | null;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessagesResult {
  list: ChatMessage[];
  total: number;
}

export interface ChatPresence {
  doctorOnline: boolean;
  patientOnline: boolean;
}
