import client from './client';
import type { CandidateProfile, ExperienceLevel } from '../types';

export interface CreateProfilePayload {
  name: string;
  targetRole: string;
  experienceLevel: ExperienceLevel;
  skills: string[];
  yearsExperience: number;
  targetCompany?: string;
  industry?: string;
  careerGoal?: string;
  resumeText?: string;
  id?: string; // for update
}

export async function createOrUpdateProfile(data: CreateProfilePayload): Promise<CandidateProfile> {
  const response = await client.post<CandidateProfile>('/profile', data);
  return response.data;
}

export async function getProfile(id: string): Promise<CandidateProfile> {
  const response = await client.get<CandidateProfile>(`/profile/${id}`);
  return response.data;
}
