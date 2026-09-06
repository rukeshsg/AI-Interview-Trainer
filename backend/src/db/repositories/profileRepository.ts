import { v4 as uuidv4 } from 'uuid';
import { getDb, sql } from '../database';
import { CandidateProfile, ExperienceLevel } from '../../types';

function rowToProfile(row: Record<string, unknown>): CandidateProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    targetRole: row.target_role as string,
    experienceLevel: row.experience_level as ExperienceLevel,
    skills: JSON.parse((row.skills as string) || '[]'),
    yearsExperience: row.years_experience as number,
    targetCompany: (row.target_company as string) || undefined,
    industry: (row.industry as string) || undefined,
    careerGoal: (row.career_goal as string) || undefined,
    resumeText: (row.resume_text as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function createProfile(data: Omit<CandidateProfile, 'id' | 'createdAt' | 'updatedAt'>): Promise<CandidateProfile> {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.query(sql`
    INSERT INTO candidate_profiles
      (id, name, target_role, experience_level, skills, years_experience,
       target_company, industry, career_goal, resume_text, created_at, updated_at)
    VALUES (
      ${id}, ${data.name}, ${data.targetRole}, ${data.experienceLevel},
      ${JSON.stringify(data.skills)}, ${data.yearsExperience},
      ${data.targetCompany || null}, ${data.industry || null},
      ${data.careerGoal || null}, ${data.resumeText || null},
      ${now}, ${now}
    )
  `);

  return (await getProfileById(id))!;
}

export async function getProfileById(id: string): Promise<CandidateProfile | null> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM candidate_profiles WHERE id = ${id}`) as Record<string, unknown>[];
  return rows.length > 0 ? rowToProfile(rows[0]) : null;
}

export async function updateProfile(id: string, data: Partial<Omit<CandidateProfile, 'id' | 'createdAt'>>): Promise<CandidateProfile | null> {
  const db = getDb();
  const existing = await getProfileById(id);
  if (!existing) return null;

  const now = new Date().toISOString();
  await db.query(sql`
    UPDATE candidate_profiles SET
      name = ${data.name ?? existing.name},
      target_role = ${data.targetRole ?? existing.targetRole},
      experience_level = ${data.experienceLevel ?? existing.experienceLevel},
      skills = ${JSON.stringify(data.skills ?? existing.skills)},
      years_experience = ${data.yearsExperience ?? existing.yearsExperience},
      target_company = ${data.targetCompany ?? existing.targetCompany ?? null},
      industry = ${data.industry ?? existing.industry ?? null},
      career_goal = ${data.careerGoal ?? existing.careerGoal ?? null},
      resume_text = ${data.resumeText ?? existing.resumeText ?? null},
      updated_at = ${now}
    WHERE id = ${id}
  `);

  return getProfileById(id);
}

export async function getAllProfiles(): Promise<CandidateProfile[]> {
  const db = getDb();
  const rows = await db.query(sql`SELECT * FROM candidate_profiles ORDER BY created_at DESC`) as Record<string, unknown>[];
  return rows.map(rowToProfile);
}
