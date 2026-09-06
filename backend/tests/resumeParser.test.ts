import { parseResume } from '../src/parsers/resumeParser';
import path from 'path';
import fs from 'fs';

describe('Resume Parser', () => {
  const tempDir = path.join(__dirname, 'temp');

  beforeAll(() => {
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it('rejects empty files with an error', async () => {
    const emptyFile = path.join(tempDir, 'empty.txt');
    fs.writeFileSync(emptyFile, '');

    await expect(parseResume(emptyFile, 'application/pdf')).rejects.toThrow();
  });
});
