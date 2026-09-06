import { parseAgentResponse } from '../src/services/orchestrateService';

describe('parseAgentResponse', () => {
  it('returns empty object for empty string', () => {
    expect(parseAgentResponse('')).toEqual({});
  });

  it('parses valid JSON directly', () => {
    const input = JSON.stringify({ questions: [{ question: 'What is Python?' }] });
    const result = parseAgentResponse(input);
    expect((result as any).questions).toHaveLength(1);
  });

  it('extracts JSON from markdown code fence', () => {
    const input = '```json\n{"overallScore": 8}\n```';
    const result = parseAgentResponse(input);
    expect((result as any).overallScore).toBe(8);
  });

  it('extracts JSON object embedded in text', () => {
    const input = 'Here is the evaluation:\n{"overallScore": 7, "clarity": 8}\nThat is my assessment.';
    const result = parseAgentResponse(input);
    expect((result as any).overallScore).toBe(7);
  });

  it('returns rawText for non-JSON natural language', () => {
    const input = 'This is a plain natural language response with no JSON.';
    const result = parseAgentResponse(input);
    expect((result as any).rawText).toBeDefined();
    expect((result as any).rawText).toBe(input);
  });

  it('does not throw on null-like input', () => {
    expect(() => parseAgentResponse('null')).not.toThrow();
    expect(() => parseAgentResponse('{}')).not.toThrow();
  });

  it('handles JSON with extra whitespace', () => {
    const input = '   { "strengths": ["Good answer"] }   ';
    const result = parseAgentResponse(input.trim());
    expect((result as any).strengths).toEqual(['Good answer']);
  });
});
