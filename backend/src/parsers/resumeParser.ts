import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import fs from 'fs';
import { ResumeData } from '../types';

// Extract skills by looking for skill-like keywords in text
function extractSkills(text: string): string[] {
  const SKILL_KEYWORDS = [
    // Programming languages
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'R', 'MATLAB', 'Scala',
    // Web
    'React', 'Angular', 'Vue', 'Node.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel', 'HTML', 'CSS', 'Tailwind',
    // Data / ML
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
    // Cloud / DevOps
    'AWS', 'Azure', 'GCP', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible',
    // Tools
    'Git', 'Linux', 'REST', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'JIRA',
    // IBM
    'IBM', 'watsonx', 'Watson', 'IBM Cloud',
  ];

  const found = new Set<string>();
  const lowerText = text.toLowerCase();

  for (const skill of SKILL_KEYWORDS) {
    if (lowerText.includes(skill.toLowerCase())) {
      found.add(skill);
    }
  }

  return Array.from(found);
}

// Extract lines that look like experience/education entries
function extractSection(text: string, sectionKeywords: string[]): string[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 10);
  const results: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (sectionKeywords.some((kw) => lower.includes(kw))) {
      inSection = true;
      continue;
    }
    // Stop at next section header (short all-caps or known section names)
    if (inSection && line.length < 40 && line === line.toUpperCase() && line.length > 3) {
      inSection = false;
    }
    if (inSection && line.length > 15) {
      results.push(line);
    }
    if (results.length >= 8) break;
  }

  return results.slice(0, 6);
}

export async function parseResume(filePath: string, mimeType: string): Promise<ResumeData> {
  let rawText = '';

  if (mimeType === 'application/pdf') {
    const buffer = fs.readFileSync(filePath);
    const result = await pdfParse(buffer);
    rawText = result.text || '';
  } else {
    // DOCX
    const result = await mammoth.extractRawText({ path: filePath });
    rawText = result.value || '';
  }

  if (!rawText.trim()) {
    throw new Error('No text content could be extracted from the file.');
  }

  const skills = extractSkills(rawText);
  const experience = extractSection(rawText, ['experience', 'employment', 'work history', 'professional background', 'positions', 'career']);
  const education = extractSection(rawText, ['education', 'academic', 'degree', 'university', 'college', 'qualification']);
  const projects = extractSection(rawText, ['projects', 'project work', 'portfolio', 'key projects']);
  const certifications = extractSection(rawText, ['certification', 'certifications', 'certificate', 'courses', 'training', 'licenses']);

  return {
    skills,
    experience,
    education,
    projects,
    certifications,
    rawText: rawText.substring(0, 3000), // Limit raw text stored
  };
}
