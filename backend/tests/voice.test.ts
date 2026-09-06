import { isSTTConfigured, isTTSConfigured, getVoiceConfig } from '../src/services/voiceService';

describe('Voice Service Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('detects unconfigured voice services by default', () => {
    delete process.env.IBM_STT_API_KEY;
    delete process.env.IBM_STT_API_URL;
    delete process.env.IBM_TTS_API_KEY;
    delete process.env.IBM_TTS_API_URL;

    expect(isSTTConfigured()).toBe(false);
    expect(isTTSConfigured()).toBe(false);
  });

  it('detects configured STT and TTS separately', () => {
    process.env.IBM_STT_API_URL = 'https://api.us-south.speech-to-text.watson.cloud.ibm.com';
    process.env.IBM_STT_API_KEY = 'test-stt-key';
    delete process.env.IBM_TTS_API_KEY;
    delete process.env.IBM_TTS_API_URL;

    expect(isSTTConfigured()).toBe(true);
    expect(isTTSConfigured()).toBe(false);

    process.env.IBM_TTS_API_URL = 'https://api.us-south.text-to-speech.watson.cloud.ibm.com';
    process.env.IBM_TTS_API_KEY = 'test-tts-key';

    expect(isSTTConfigured()).toBe(true);
    expect(isTTSConfigured()).toBe(true);
  });
});
