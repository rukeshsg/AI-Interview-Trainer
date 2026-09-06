describe('profile validation rules', () => {
  function validate(data: Record<string, unknown>): string[] {
    const errors: string[] = [];
    if (!data.name || String(data.name).trim() === '') errors.push('name required');
    if (!data.targetRole || String(data.targetRole).trim() === '') errors.push('targetRole required');
    const validLevels = ['fresher', 'entry', 'intermediate', 'experienced'];
    if (!validLevels.includes(String(data.experienceLevel))) errors.push('invalid experienceLevel');
    if (!Array.isArray(data.skills)) errors.push('skills must be array');
    if (typeof data.yearsExperience !== 'number') errors.push('yearsExperience must be number');
    return errors;
  }

  it('passes valid data', () => {
    expect(validate({ name: 'Test', targetRole: 'Dev', experienceLevel: 'fresher', skills: [], yearsExperience: 0 })).toHaveLength(0);
  });

  it('catches missing name', () => {
    const errs = validate({ name: '', targetRole: 'Dev', experienceLevel: 'fresher', skills: [], yearsExperience: 0 });
    expect(errs).toContain('name required');
  });

  it('catches invalid experience level', () => {
    const errs = validate({ name: 'T', targetRole: 'D', experienceLevel: 'expert', skills: [], yearsExperience: 0 });
    expect(errs).toContain('invalid experienceLevel');
  });

  it('catches non-array skills', () => {
    const errs = validate({ name: 'T', targetRole: 'D', experienceLevel: 'fresher', skills: 'python', yearsExperience: 0 });
    expect(errs).toContain('skills must be array');
  });
});

describe('resume file validation', () => {
  function validateFile(mimeType: string, sizeBytes: number): string | null {
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(mimeType)) return 'Only PDF and DOCX files are supported.';
    if (sizeBytes > 10 * 1024 * 1024) return 'File must be under 10MB.';
    return null;
  }

  it('accepts valid PDF', () => {
    expect(validateFile('application/pdf', 1024 * 1024)).toBeNull();
  });

  it('accepts valid DOCX', () => {
    expect(validateFile('application/vnd.openxmlformats-officedocument.wordprocessingml.document', 500000)).toBeNull();
  });

  it('rejects unsupported type', () => {
    expect(validateFile('image/png', 1000)).not.toBeNull();
  });

  it('rejects oversized file', () => {
    expect(validateFile('application/pdf', 11 * 1024 * 1024)).not.toBeNull();
  });
});
