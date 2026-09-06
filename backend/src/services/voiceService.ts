import axios from 'axios';

// ────────────────────────────────────────────────────────────────────────────
// IBM Voice Services (STT & TTS have separate credentials)
// ────────────────────────────────────────────────────────────────────────────
export function getVoiceConfig() {
  return {
    sttUrl: process.env.IBM_STT_API_URL || '',
    sttKey: process.env.IBM_STT_API_KEY || '',
    ttsUrl: process.env.IBM_TTS_API_URL || '',
    ttsKey: process.env.IBM_TTS_API_KEY || '',
  };
}

export function isSTTConfigured(): boolean {
  const cfg = getVoiceConfig();
  return Boolean(cfg.sttUrl && cfg.sttKey);
}

export function isTTSConfigured(): boolean {
  const cfg = getVoiceConfig();
  return Boolean(cfg.ttsUrl && cfg.ttsKey);
}

/**
 * Synthesizes text into speech audio using IBM Text to Speech
 */
export async function synthesizeSpeech(text: string): Promise<{ data: Buffer; contentType: string }> {
  const cfg = getVoiceConfig();
  if (!isTTSConfigured()) {
    throw new Error('IBM Text to Speech is not configured on the server.');
  }

  const authHeader = 'Basic ' + Buffer.from(`apikey:${cfg.ttsKey}`).toString('base64');
  const url = `${cfg.ttsUrl.replace(/\/$/, '')}/v1/synthesize?voice=en-US_AllisonV3Voice`;

  const response = await axios.post(
    url,
    { text },
    {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
        Accept: 'audio/mp3',
      },
      responseType: 'arraybuffer',
      timeout: 30000,
    }
  );

  return {
    data: Buffer.from(response.data),
    contentType: String(response.headers['content-type'] || 'audio/mp3'),
  };
}

/**
 * Transcribes speech audio using IBM Speech to Text
 */
export async function recognizeSpeech(audioBuffer: Buffer, mimeType = 'audio/wav'): Promise<string> {
  const cfg = getVoiceConfig();
  if (!isSTTConfigured()) {
    throw new Error('IBM Speech to Text is not configured on the server.');
  }

  const authHeader = 'Basic ' + Buffer.from(`apikey:${cfg.sttKey}`).toString('base64');
  const url = `${cfg.sttUrl.replace(/\/$/, '')}/v1/recognize?model=en-US_BroadbandModel`;

  const response = await axios.post(url, audioBuffer, {
    headers: {
      Authorization: authHeader,
      'Content-Type': mimeType,
      Accept: 'application/json',
    },
    timeout: 30000,
  });

  const results = response.data?.results || [];
  const transcripts: string[] = [];
  for (const r of results) {
    if (r.alternatives?.[0]?.transcript) {
      transcripts.push(r.alternatives[0].transcript);
    }
  }

  return transcripts.join(' ').trim();
}
