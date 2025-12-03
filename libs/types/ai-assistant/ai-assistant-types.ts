export interface AskAiContextInput {
  userId?: string;
  role?: 'USER' | 'DOCTOR' | 'CLINIC' | 'ADMIN' | string;
  lang?: 'en' | 'ko' | 'ru' | 'uz';
  clientId?: string;
  clinicId?: string;
  doctorId?: string;
  appointmentId?: string;
}

export interface AskAiInput {
  message: string;
  context?: AskAiContextInput;
}

export interface AskAiResponse {
  reply: string;
}