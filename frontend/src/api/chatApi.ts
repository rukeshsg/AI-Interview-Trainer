import client from './client';
import type { CandidateProfile } from '../types';

export interface ChatResponse {
  reply: string;
}

export async function sendChatMessage(
  message: string,
  profileId?: string,
  history?: { role: 'user' | 'assistant'; content: string }[],
  profile?: Partial<CandidateProfile>
): Promise<ChatResponse> {
  const response = await client.post<ChatResponse>('/chat', {
    message,
    profileId,
    history,
    profile,
  });
  return response.data;
}
