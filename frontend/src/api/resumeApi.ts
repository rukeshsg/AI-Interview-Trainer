import client from './client';
import type { ResumeData } from '../types';

export interface ResumeUploadResponse {
  success: boolean;
  filename: string;
  size: number;
  data: ResumeData;
}

export async function uploadResume(file: File): Promise<ResumeUploadResponse> {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await client.post<ResumeUploadResponse>('/resume/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}
