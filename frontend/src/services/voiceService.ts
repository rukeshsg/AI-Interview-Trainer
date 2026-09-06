// ────────────────────────────────────────────────────────────────────────────
// Voice Service — Text-to-Speech (TTS) and Speech-to-Text (STT)
// Supports IBM Watson voice backend with graceful Web Speech API fallback.
// ────────────────────────────────────────────────────────────────────────────

export interface VoiceStatus {
  available: boolean;
  stt: boolean;
  tts: boolean;
  provider: string;
}

/**
 * Checks server-side voice service status (IBM STT & TTS configuration)
 */
export async function checkVoiceStatus(): Promise<VoiceStatus> {
  try {
    const res = await fetch('/api/voice/status');
    if (res.ok) {
      const data = await res.json();
      return {
        available: Boolean(data.available ?? (data.stt || data.tts || data.sttConfigured || data.ttsConfigured)),
        stt: Boolean(data.stt ?? data.sttConfigured),
        tts: Boolean(data.tts ?? data.ttsConfigured),
        provider: data.provider || 'IBM Watson Speech Services',
      };
    }
  } catch {
    // Network / fallback
  }
  return {
    available: false,
    stt: false,
    tts: false,
    provider: 'None',
  };
}

// Check if browser SpeechRecognition is available
export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && (
    'SpeechRecognition' in window || 'webkitSpeechRecognition' in window
  );
}

// Check if browser SpeechSynthesis is available
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

let activeAudio: HTMLAudioElement | null = null;
// Track single active speech recognition instance globally to prevent duplicate listeners
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let activeRecognitionInstance: any = null;

/**
 * Speaks text using IBM TTS API if configured, falling back to Web Speech Synthesis API.
 */
export async function speakText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): Promise<() => void> {
  // Stop any currently playing audio
  stopSpeaking();

  // Try IBM TTS endpoint first
  try {
    const response = await fetch('/api/voice/synthesize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      activeAudio = audio;

      audio.onplay = () => onStart?.();
      audio.onended = () => {
        activeAudio = null;
        URL.revokeObjectURL(url);
        onEnd?.();
      };
      audio.onerror = () => {
        activeAudio = null;
        URL.revokeObjectURL(url);
        fallbackBrowserTTS(text, onStart, onEnd, onError);
      };

      audio.play().catch(() => {
        fallbackBrowserTTS(text, onStart, onEnd, onError);
      });

      return () => {
        audio.pause();
        activeAudio = null;
        URL.revokeObjectURL(url);
      };
    }
  } catch {
    // Backend IBM TTS not available or returned error; fall back to browser TTS
  }

  // Browser Web Speech API fallback
  return fallbackBrowserTTS(text, onStart, onEnd, onError);
}

function fallbackBrowserTTS(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (error: string) => void
): () => void {
  if (!isSpeechSynthesisSupported()) {
    onError?.('Speech synthesis is not supported in this browser.');
    return () => {};
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = (e) => onError?.(e.error);

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

export function stopSpeaking(): void {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Listens to candidate's microphone using Web Speech Recognition.
 * Accurately tracks new final chunks and live interim text without duplicating words.
 * Guarantees exactly one active recognizer instance at a time.
 */
export function startSpeechRecognition(
  onTranscriptUpdate: (finalChunk: string, interimText: string) => void,
  onError: (err: string) => void,
  onEnd: () => void
): () => void {
  // Stop existing instance if running
  if (activeRecognitionInstance) {
    try {
      activeRecognitionInstance.abort();
    } catch { /* ignore */ }
    activeRecognitionInstance = null;
  }

  if (!isSpeechRecognitionSupported()) {
    onError('Speech recognition is not supported in this browser. Please use Google Chrome, Edge, or enter your answer as text.');
    onEnd();
    return () => {};
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognitionClass();
  activeRecognitionInstance = recognition;

  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  // Track the last index that was committed as final to prevent re-processing
  let lastFinalIndex = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onresult = (event: any) => {
    let newFinalChunk = '';
    let interimText = '';

    for (let i = lastFinalIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      if (result.isFinal) {
        newFinalChunk += (newFinalChunk ? ' ' : '') + result[0].transcript.trim();
        lastFinalIndex = i + 1;
      } else {
        interimText += (interimText ? ' ' : '') + result[0].transcript.trim();
      }
    }

    onTranscriptUpdate(newFinalChunk, interimText);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  recognition.onerror = (event: any) => {
    if (event.error === 'no-speech') return; // ignore ambient silence
    onError(event.error === 'not-allowed' ? 'Microphone access denied.' : `Speech error: ${event.error}`);
  };

  recognition.onend = () => {
    if (activeRecognitionInstance === recognition) {
      activeRecognitionInstance = null;
    }
    onEnd();
  };

  try {
    recognition.start();
  } catch (err: unknown) {
    onError((err as Error).message || 'Failed to start microphone.');
    if (activeRecognitionInstance === recognition) {
      activeRecognitionInstance = null;
    }
    onEnd();
  }

  return () => {
    if (activeRecognitionInstance === recognition) {
      activeRecognitionInstance = null;
    }
    try {
      recognition.stop();
    } catch {
      // ignore
    }
  };
}
